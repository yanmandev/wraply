import { counterpartyApi } from '@shared/api/counterparty';
import { dealApi } from '@shared/api/deal';
import {
  qualificationToPayload,
  requisitesToPayload,
  toUpdatePayload,
  type DealFormValues,
} from '../../shared/dealForm';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const ids = (list: { id: number }[]) => new Set(list.map((x) => x.id));

/**
 * Сохраняет разницу между base (что было на сервере) и values (что в форме).
 * Сделка складывается из нескольких сущностей, поэтому это серия запросов — по порядку:
 * поля сделки → квалификация → реквизиты → связи с контрагентами → связи с контактами.
 * Если запрос упал, остальные не выполняются; вызывающий перечитывает карточку с сервера.
 */
export async function saveDeal(number: string, base: DealFormValues, values: DealFormValues) {
  /* поля сделки */
  if (!same(toUpdatePayload(base), toUpdatePayload(values))) {
    await dealApi.update(number, toUpdatePayload(values));
  }

  /* квалификация */
  if (!same(base.qualification, values.qualification)) {
    await dealApi.updateQualification(number, qualificationToPayload(values.qualification));
  }

  /* реквизиты контрагентов, которые были и остались в сделке */
  for (const cp of values.counterparties) {
    const before = base.counterparties.find((c) => c.id === cp.id);
    if (before && !same(requisitesToPayload(before), requisitesToPayload(cp))) {
      await counterpartyApi.update(cp.id, requisitesToPayload(cp));
    }
  }

  /* связи с контрагентами */
  const cpBefore = ids(base.counterparties);
  const cpNow = ids(values.counterparties);
  const cpRemoved = [...cpBefore].filter((id) => !cpNow.has(id));
  const cpAdded = [...cpNow].filter((id) => !cpBefore.has(id));

  for (const id of cpRemoved) {
    await dealApi.unlinkCounterparty(number, id); // Xano отвяжет и контакты этого контрагента
  }
  for (const id of cpAdded) {
    await dealApi.linkCounterparty(number, id, id === values.primary_counterparty_id);
  }
  const primaryCp = values.primary_counterparty_id;
  if (
    primaryCp !== null &&
    primaryCp !== base.primary_counterparty_id &&
    !cpAdded.includes(primaryCp)
  ) {
    await dealApi.setPrimaryCounterparty(number, primaryCp);
  }

  /* связи с контактами */
  const contactsNow = ids(values.contacts);
  const contactsBefore = ids(base.contacts);
  const contactRemoved = base.contacts.filter(
    // контакты удалённых контрагентов уже отвязаны вместе с ними
    (c) => !contactsNow.has(c.id) && !cpRemoved.includes(c.counterparty_id),
  );
  const contactAdded = values.contacts.filter((c) => !contactsBefore.has(c.id));

  for (const c of contactRemoved) {
    await dealApi.unlinkContact(number, c.id);
  }
  for (const c of contactAdded) {
    await dealApi.linkContact(number, c.id, c.id === values.primary_contact_id);
  }
  const primaryContact = values.primary_contact_id;
  if (
    primaryContact !== null &&
    primaryContact !== base.primary_contact_id &&
    !contactAdded.some((c) => c.id === primaryContact)
  ) {
    await dealApi.setPrimaryContact(number, primaryContact);
  }
}

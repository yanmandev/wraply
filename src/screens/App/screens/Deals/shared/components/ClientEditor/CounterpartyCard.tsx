import { useState } from 'react';
import { Button, Checkbox, Radio, Segmented, Skeleton, Tag, Tooltip } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  COUNTERPARTY_TYPE_LABEL,
  counterpartyTypeOptions,
  type CounterpartyType,
} from '@shared/constants/counterparty';
import { useCounterpartyContacts } from '@shared/api/contact';
import { FormField } from '@shared/components/FormField';
import { formatPhone } from '@shared/lib/phone';
import type { CounterpartyContact } from '@shared/types/deal';
import { ContactModal } from '../ContactModal';
import { RequisitesFields } from '../RequisitesFields';
import { itemName, type DealFormValues } from '../../dealForm';
import s from './ClientEditor.module.less';

interface Props {
  index: number;
  editRequisites: boolean;
  onRemove: () => void;
  onToggleContact: (contact: CounterpartyContact, checked: boolean) => void;
}

/** Контрагент в сделке: основной/нет, реквизиты (на странице сделки) и контакты по сделке */
export function CounterpartyCard({ index, editRequisites, onRemove, onToggleContact }: Props) {
  const { control, setValue, formState } = useFormContext<DealFormValues>();
  const cp = useWatch({ control, name: `counterparties.${index}` });
  const primaryCp = useWatch({ control, name: 'primary_counterparty_id' });
  const selected = useWatch({ control, name: 'contacts' });
  const primaryContact = useWatch({ control, name: 'primary_contact_id' });
  const contacts = useCounterpartyContacts(cp.id);

  const [reqToggled, setReqToggled] = useState(false);
  const hasReqErrors = !!formState.errors.counterparties?.[index];
  // ошибка в реквизитах (после «Сохранить») — держим раскрытыми, чтобы её было видно
  const reqOpen = reqToggled || hasReqErrors;
  const setReqOpen = (fn: (open: boolean) => boolean) => setReqToggled(fn(reqOpen));

  const name = itemName(cp);
  const isPrimary = primaryCp === cp.id;
  const isSelected = (id: number) => selected.some((c) => c.id === id);

  const openContact = async (contact?: CounterpartyContact) => {
    const saved = (await NiceModal.show(ContactModal, {
      counterpartyId: cp.id,
      counterpartyName: name,
      contact,
    })) as CounterpartyContact | undefined;
    // новый контакт сразу добавляем в сделку
    if (saved && !contact) onToggleContact(saved, true);
  };

  return (
    <section className={clsx(s.card, isPrimary && s.cardPrimary)}>
      <header className={s.cardHead}>
        <div className={s.cardTitle}>
          <b>{name}</b>
          <span>
            {COUNTERPARTY_TYPE_LABEL[cp.type]}
            {cp.inn && ` · ИНН ${cp.inn}`}
          </span>
        </div>
        <Radio
          checked={isPrimary}
          onChange={() => setValue('primary_counterparty_id', cp.id, { shouldDirty: true })}
        >
          Основной клиент
        </Radio>
        <Tooltip title="Убрать из сделки">
          <Button size="small" danger type="text" onClick={onRemove} aria-label={`Убрать ${name}`}>
            ✕
          </Button>
        </Tooltip>
      </header>

      {editRequisites && (
        <div className={clsx(s.requisites, hasReqErrors && s.requisitesError)}>
          <button
            type="button"
            className={s.accHead}
            aria-expanded={reqOpen}
            onClick={() => setReqOpen((o) => !o)}
          >
            <b>Реквизиты</b>
            {hasReqErrors && <Tag color="error">есть ошибки</Tag>}
            <span className={clsx(s.chev, reqOpen && s.chevOpen)} aria-hidden>
              ▾
            </span>
          </button>
          {reqOpen && (
            <div className={s.accBody}>
              <FormField control={control} name={`counterparties.${index}.type`} label="Тип">
                {(field) => (
                  <Segmented<CounterpartyType>
                    options={counterpartyTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              </FormField>
              <RequisitesFields type={cp.type} prefix={`counterparties.${index}.`} />
              <p className={s.hint}>
                Реквизиты общие для всех сделок этого контрагента — сохраняются кнопкой «Сохранить».
              </p>
            </div>
          )}
        </div>
      )}

      <div className={s.contacts}>
        <div className={s.contactsHead}>
          <b>Контакты по сделке</b>
          <Button size="small" type="dashed" onClick={() => openContact()}>
            + контакт
          </Button>
        </div>

        {contacts.isLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        ) : contacts.isError ? (
          <span className={s.muted}>Не удалось загрузить контакты</span>
        ) : !contacts.data?.length ? (
          <span className={s.muted}>У контрагента пока нет контактов</span>
        ) : (
          <ul className={s.contactList}>
            {contacts.data.map((c) => (
              <li key={c.id} className={clsx(s.contact, isSelected(c.id) && s.contactOn)}>
                <Checkbox
                  checked={isSelected(c.id)}
                  onChange={(e) => onToggleContact(c, e.target.checked)}
                >
                  <span className={s.contactName}>{c.name}</span>
                  {c.phone && <span className={s.contactMeta}>{formatPhone(c.phone)}</span>}
                  {c.note && <span className={s.contactMeta}>{c.note}</span>}
                </Checkbox>
                <span className={s.contactActions}>
                  {isSelected(c.id) &&
                    (primaryContact === c.id ? (
                      <Tag color="blue">основной</Tag>
                    ) : (
                      <Button
                        size="small"
                        type="link"
                        onClick={() => setValue('primary_contact_id', c.id, { shouldDirty: true })}
                      >
                        сделать основным
                      </Button>
                    ))}
                  <Tooltip title="Изменить контакт">
                    <Button
                      size="small"
                      type="text"
                      aria-label={`Изменить контакт ${c.name}`}
                      onClick={() => openContact(c)}
                    >
                      ✎
                    </Button>
                  </Tooltip>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

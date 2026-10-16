import { Button, Checkbox, Radio, Skeleton, Tag, Tooltip } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
import { COUNTERPARTY_TYPE_LABEL } from '@shared/constants/counterparty';
import { useCounterpartyContacts } from '@shared/api/contact';
import { formatPhone } from '@shared/lib/phone';
import type { CounterpartyContact } from '@shared/types/deal';
import { ContactModal } from '../../../../shared/components/ContactModal';
import type { DealFormValues } from '../../schema';
import s from './StepClient.module.less';

interface Props {
  counterparty: DealFormValues['counterparties'][number];
  onRemove: () => void;
  onToggleContact: (contact: CounterpartyContact, checked: boolean) => void;
}

/** Контрагент в сделке: основной/нет + выбор его контактов для сделки */
export function CounterpartyCard({ counterparty: cp, onRemove, onToggleContact }: Props) {
  const { control, setValue } = useFormContext<DealFormValues>();
  const primaryCp = useWatch({ control, name: 'primary_counterparty_id' });
  const selected = useWatch({ control, name: 'contacts' });
  const primaryContact = useWatch({ control, name: 'primary_contact_id' });
  const contacts = useCounterpartyContacts(cp.id);

  const isSelected = (id: number) => selected.some((c) => c.id === id);
  const isPrimary = primaryCp === cp.id;

  const addContact = async () => {
    const created = (await NiceModal.show(ContactModal, {
      counterpartyId: cp.id,
      counterpartyName: cp.name,
    })) as CounterpartyContact | undefined;
    if (created) onToggleContact(created, true); // новый контакт сразу в сделке
  };

  return (
    <section className={clsx(s.card, isPrimary && s.cardPrimary)}>
      <header className={s.cardHead}>
        <div className={s.cardTitle}>
          <b>{cp.name}</b>
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
          <Button
            size="small"
            danger
            type="text"
            onClick={onRemove}
            aria-label={`Убрать ${cp.name}`}
          >
            ✕
          </Button>
        </Tooltip>
      </header>

      <div className={s.contacts}>
        <div className={s.contactsHead}>
          <b>Контакты по сделке</b>
          <Button size="small" type="dashed" onClick={addContact}>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

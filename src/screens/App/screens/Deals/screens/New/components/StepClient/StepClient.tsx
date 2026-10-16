import { useState } from 'react';
import { Alert, Button, Empty, Select, Spin } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { counterpartyName, useCounterpartySearch } from '@shared/api/counterparty';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import type { Counterparty, CounterpartyContact } from '@shared/types/deal';
import { CounterpartyModal } from '../../../../shared/components/CounterpartyModal';
import type { DealFormValues } from '../../schema';
import { CounterpartyCard } from './CounterpartyCard';
import s from './StepClient.module.less';

/** Шаг 2: контрагенты сделки и контакты по сделке */
export function StepClient() {
  const { control, setValue, getValues, formState } = useFormContext<DealFormValues>();
  const counterparties = useWatch({ control, name: 'counterparties' });
  const opts = { shouldValidate: true, shouldDirty: true } as const;

  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, 300);
  const found = useCounterpartySearch(debounced);
  const added = new Set(counterparties.map((c) => c.id));

  const addCounterparty = (c: Counterparty) => {
    if (added.has(c.id)) return;
    setValue(
      'counterparties',
      [
        ...getValues('counterparties'),
        { id: c.id, name: counterpartyName(c), type: c.type, inn: c.inn },
      ],
      opts,
    );
    // первый добавленный — основной
    if (getValues('primary_counterparty_id') === null)
      setValue('primary_counterparty_id', c.id, opts);
  };

  const removeCounterparty = (id: number) => {
    const rest = getValues('counterparties').filter((c) => c.id !== id);
    setValue('counterparties', rest, opts);
    if (getValues('primary_counterparty_id') === id) {
      setValue('primary_counterparty_id', rest[0]?.id ?? null, opts);
    }
    // вместе с контрагентом уходят и его контакты
    const contacts = getValues('contacts').filter((c) => c.counterparty_id !== id);
    setValue('contacts', contacts, opts);
    if (!contacts.some((c) => c.id === getValues('primary_contact_id'))) {
      setValue('primary_contact_id', contacts[0]?.id ?? null, opts);
    }
  };

  const toggleContact = (contact: CounterpartyContact, checked: boolean) => {
    const current = getValues('contacts');
    const next = checked
      ? [...current, { id: contact.id, counterparty_id: contact.counterparty_id }]
      : current.filter((c) => c.id !== contact.id);
    setValue('contacts', next, opts);

    const primary = getValues('primary_contact_id');
    if (checked && primary === null) setValue('primary_contact_id', contact.id, opts);
    if (!checked && primary === contact.id)
      setValue('primary_contact_id', next[0]?.id ?? null, opts);
  };

  const createCounterparty = async () => {
    const created = (await NiceModal.show(CounterpartyModal)) as Counterparty | undefined;
    if (created) addCounterparty(created);
  };

  const listError = formState.errors.counterparties?.message;

  return (
    <div className={s.root}>
      <div className={s.picker}>
        <Select<number>
          className={s.search}
          placeholder="Найти контрагента по названию или ИНН"
          value={null}
          showSearch={{ filterOption: false, onSearch: setSearch, searchValue: search }}
          onSelect={(id) => {
            const c = found.data?.find((x) => x.id === id);
            if (c) addCounterparty(c);
            setSearch('');
          }}
          notFoundContent={found.isFetching ? <Spin size="small" /> : 'Ничего не найдено'}
          options={found.data?.map((c) => ({
            value: c.id,
            disabled: added.has(c.id),
            label: (
              <div className={s.option}>
                <span>{counterpartyName(c)}</span>
                {c.inn && <small>ИНН {c.inn}</small>}
              </div>
            ),
          }))}
        />
        <Button onClick={createCounterparty}>+ Новый контрагент</Button>
      </div>

      {found.isError && (
        <Alert
          type="warning"
          showIcon
          title="Поиск контрагентов недоступен — проверьте группу Counterparty в .env"
        />
      )}

      {listError && <Alert type="error" showIcon title={listError} />}

      {counterparties.length === 0 ? (
        <Empty
          className={s.empty}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Найдите существующего контрагента или создайте нового"
        />
      ) : (
        <div className={s.cards}>
          {counterparties.map((c) => (
            <CounterpartyCard
              key={c.id}
              counterparty={c}
              onRemove={() => removeCounterparty(c.id)}
              onToggleContact={toggleContact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

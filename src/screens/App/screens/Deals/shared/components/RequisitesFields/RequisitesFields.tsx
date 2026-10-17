import { DatePicker, Input } from 'antd';
import { useFormContext, type Control, type FieldValues } from 'react-hook-form';
import {
  COUNTERPARTY_FIELDS,
  requisiteLabel,
  type CounterpartyType,
  type RequisiteField,
} from '@shared/constants/counterparty';
import { FormField } from '@shared/components/FormField';
import { dayjs } from '@shared/lib/date';
import s from './RequisitesFields.module.less';

const WIDE: RequisiteField[] = ['full_name', 'short_name', 'address'];
const DIGITS: RequisiteField[] = ['inn', 'kpp', 'ogrn', 'okpo', 'oktmo'];

interface Props {
  type: CounterpartyType;
  /** Путь к объекту реквизитов в форме: '' (форма = реквизиты) или 'counterparties.0.' */
  prefix?: string;
}

/**
 * Поля реквизитов для выбранного типа контрагента.
 * Работает в любой форме, где реквизиты лежат по пути prefix — поэтому имена полей строковые.
 */
export function RequisitesFields({ type, prefix = '' }: Props) {
  // Путь динамический (prefix) — типизировать имена полей тут не получится
  const { control } = useFormContext<FieldValues>() as { control: Control<FieldValues> };
  const { visible, required } = COUNTERPARTY_FIELDS[type];

  return (
    <div className={s.grid}>
      {visible.map((name) => (
        <FormField
          key={name}
          control={control}
          name={`${prefix}${name}`}
          label={requisiteLabel(type, name)}
          required={required.includes(name)}
          className={WIDE.includes(name) ? s.wide : undefined}
        >
          {(field) =>
            name === 'registered_at' ? (
              <DatePicker
                id={field.id}
                className={s.full}
                format="DD.MM.YYYY"
                value={field.value ? dayjs(field.value) : null}
                onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : null)}
              />
            ) : (
              <Input
                id={field.id}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputMode={DIGITS.includes(name) ? 'numeric' : undefined}
              />
            )
          }
        </FormField>
      ))}
    </div>
  );
}

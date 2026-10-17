import { Input, Select } from 'antd';
import { useFormContext } from 'react-hook-form';
import { clientTypeOptions } from '@shared/constants/deal';
import { FormField } from '@shared/components/FormField';
import { UserSelect } from '../../../shared/components/UserSelect';
import type { DealFormValues } from '../../../shared/dealForm';
import s from '../NewDeal.module.less';

/** Шаг 1: название, тип клиента, ответственные */
export function StepMain() {
  const { control } = useFormContext<DealFormValues>();

  return (
    <div className={s.grid}>
      <FormField control={control} name="name" label="Название сделки" required className={s.wide}>
        {(field) => (
          <Input
            {...field}
            autoFocus
            placeholder="Например: Haval / оклейка 3 ТС"
            maxLength={200}
          />
        )}
      </FormField>

      <FormField control={control} name="client_type" label="Тип клиента">
        {(field) => (
          <Select
            id={field.id}
            allowClear
            placeholder="Не выбран"
            options={clientTypeOptions}
            value={field.value}
            onChange={(v) => field.onChange(v ?? null)}
          />
        )}
      </FormField>

      <div />

      <FormField control={control} name="mop_id" label="МОП по сделке">
        {(field) => (
          <UserSelect id={field.id} role="mop" value={field.value} onChange={field.onChange} />
        )}
      </FormField>

      <FormField control={control} name="mos_id" label="МОС по сделке">
        {(field) => (
          <UserSelect id={field.id} role="mos" value={field.value} onChange={field.onChange} />
        )}
      </FormField>
    </div>
  );
}

import { Input, Select } from 'antd';
import { useFormContext } from 'react-hook-form';
import { clientTypeOptions } from '@shared/constants/deal';
import { FormField } from '@shared/components/FormField';
import { useUsers } from '@shared/api/user';
import type { UserBrief } from '@shared/types/deal';
import type { DealFormValues } from '../schema';
import s from '../NewDeal.module.less';

const userOptions = (users?: UserBrief[]) =>
  users?.map((u) => ({ value: u.id, label: u.name || u.email }));

/** Шаг 1: название, тип клиента, ответственные */
export function StepMain() {
  const { control } = useFormContext<DealFormValues>();
  const mops = useUsers('mop');
  const moss = useUsers('mos');

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
          <Select
            id={field.id}
            allowClear
            placeholder="Не назначен"
            loading={mops.isLoading}
            options={userOptions(mops.data)}
            showSearch={{ optionFilterProp: 'label' }}
            value={field.value}
            onChange={(v) => field.onChange(v ?? null)}
          />
        )}
      </FormField>

      <FormField control={control} name="mos_id" label="МОС по сделке">
        {(field) => (
          <Select
            id={field.id}
            allowClear
            placeholder="Не назначен"
            loading={moss.isLoading}
            options={userOptions(moss.data)}
            showSearch={{ optionFilterProp: 'label' }}
            value={field.value}
            onChange={(v) => field.onChange(v ?? null)}
          />
        )}
      </FormField>
    </div>
  );
}

import { Input, InputNumber, Progress, Select } from 'antd';
import { useFormContext, useWatch } from 'react-hook-form';
import { QUALIFICATION_FIELDS } from '@shared/constants/deal';
import type { Option } from '@shared/constants/options';
import { FormField } from '@shared/components/FormField';
import type { DealFormValues, QualificationValues } from '../schema';
import s from '../NewDeal.module.less';

// Тип клиента хранится в deal и заполняется на первом шаге
const FIELDS = QUALIFICATION_FIELDS.filter(
  (f): f is Extract<(typeof QUALIFICATION_FIELDS)[number], { key: keyof QualificationValues }> =>
    f.key !== 'client_type',
);

/** Шаг 3: квалификация (заполняет МОП, все поля необязательны) */
export function StepQualification() {
  const { control } = useFormContext<DealFormValues>();
  const values = useWatch({ control, name: 'qualification' });
  const filled = FIELDS.filter((f) => {
    const v = values[f.key];
    return v !== null && v !== '';
  }).length;

  return (
    <>
      <div className={s.progress}>
        <Progress
          percent={Math.round((filled / FIELDS.length) * 100)}
          showInfo={false}
          size="small"
          status="normal"
        />
        <span>
          {filled} из {FIELDS.length}
        </span>
      </div>

      <div className={s.grid}>
        {FIELDS.map((f, i) => (
          <FormField
            key={f.key}
            control={control}
            name={`qualification.${f.key}`}
            label={`${i + 1}. ${f.label}`}
          >
            {(field) => {
              if (f.kind === 'select') {
                return (
                  <Select<string>
                    id={field.id}
                    allowClear
                    placeholder="—"
                    options={f.options as readonly Option[] as Option[]}
                    value={field.value as string | null}
                    onChange={(v) => field.onChange(v ?? null)}
                  />
                );
              }
              if (f.kind === 'number') {
                return (
                  <InputNumber
                    id={field.id}
                    className={s.full}
                    min={0}
                    precision={0}
                    placeholder={f.placeholder}
                    value={field.value as number | null}
                    onChange={(v) => field.onChange(v ?? null)}
                  />
                );
              }
              return (
                <Input
                  id={field.id}
                  placeholder={f.placeholder}
                  value={(field.value as string) ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              );
            }}
          </FormField>
        ))}
      </div>
    </>
  );
}

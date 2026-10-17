import type { ReactNode } from 'react';
import { Input, InputNumber, Select } from 'antd';
import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Option } from '@shared/constants/options';
import { FormField } from '@shared/components/FormField';
import { QUALIFICATION_QUESTIONS, type DealFormValues } from '../../dealForm';
import s from './QualificationFields.module.less';

interface Props {
  /** номер первого вопроса */
  startIndex?: number;
  /** вопросы в рамках, заполненные подсвечиваются (как в прототипе) */
  boxed?: boolean;
  /** доп. ячейки в той же сетке — до и после вопросов */
  before?: ReactNode;
  after?: ReactNode;
}

/** Вопросы квалификации (без типа клиента). Поля формы: qualification.* */
export function QualificationFields({ startIndex = 1, boxed, before, after }: Props) {
  const { control } = useFormContext<DealFormValues>();
  const values = useWatch({ control, name: 'qualification' });

  return (
    <div className={clsx(s.grid, boxed && s.boxed)}>
      {before}
      {QUALIFICATION_QUESTIONS.map((f, i) => {
        const v = values[f.key];
        const filled = v !== null && v !== '';
        return (
          <FormField
            key={f.key}
            control={control}
            name={`qualification.${f.key}`}
            label={`${startIndex + i}. ${f.label}`}
            className={clsx(s.item, boxed && filled && s.filled)}
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
                    onChange={(val) => field.onChange(val ?? null)}
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
                    onChange={(val) => field.onChange(val ?? null)}
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
        );
      })}
      {after}
    </div>
  );
}

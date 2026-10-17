import { Select } from 'antd';
import clsx from 'clsx';
import { useFormContext, useWatch } from 'react-hook-form';
import { clientTypeOptions } from '@shared/constants/deal';
import { FormField } from '@shared/components/FormField';
import { useUsers } from '@shared/api/user';
import type { UserBrief } from '@shared/types/deal';
import {
  QualificationFields,
  qualificationItemClass,
} from '../../../shared/components/QualificationFields';
import { UserSelect } from '../../../shared/components/UserSelect';
import {
  countFilled,
  QUALIFICATION_QUESTIONS,
  type DealFormValues,
} from '../../../shared/dealForm';
import s from '../Deal.module.less';

const KEYS = QUALIFICATION_QUESTIONS.map((f) => f.key);
const TOTAL = KEYS.length + 1; // + тип клиента

interface Props {
  open: boolean;
  onToggle: () => void;
  /** МОП/МОС из карточки — имя, если сотрудника нет в списке по роли */
  mop: UserBrief | null;
  mos: UserBrief | null;
}

/** Квалификация (заполняет МОП). По умолчанию свёрнута, прогресс — в заголовке */
export function QualificationCard({ open, onToggle, mop, mos }: Props) {
  const { control } = useFormContext<DealFormValues>();
  const qualification = useWatch({ control, name: 'qualification' });
  const [clientType, mopId, mosId] = useWatch({
    control,
    name: ['client_type', 'mop_id', 'mos_id'],
  });

  const filled = countFilled(qualification, KEYS) + (clientType ? 1 : 0);
  const percent = Math.round((filled / TOTAL) * 100);

  const mops = useUsers('mop');
  const moss = useUsers('mos');
  const userName = (id: number | null, list?: UserBrief[], fallback?: UserBrief | null) => {
    if (id === null) return '—';
    const u = list?.find((x) => x.id === id) ?? (fallback?.id === id ? fallback : undefined);
    return u?.name || u?.email || '—';
  };

  return (
    <section className={clsx(s.card, s.collapsible, open && s.open)}>
      <div
        className={clsx(s.cardHead, s.qHead)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {/* слева — название, по центру — ответственные, справа — прогресс */}
        <div className={s.qTitle}>
          <h2>Квалификация</h2>
          <span className={s.sub}>заполняет МОП</span>
        </div>
        <span className={s.managers}>
          МОП: {userName(mopId, mops.data, mop)} · МОС: {userName(mosId, moss.data, mos)}
        </span>
        <div className={s.qProgress}>
          <div className={s.qBar}>
            <i style={{ width: `${percent}%` }} />
          </div>
          <span>
            {filled} из {TOTAL}
          </span>
          <span className={s.chev} aria-hidden>
            ▾
          </span>
        </div>
      </div>

      {open && (
        <div className={s.cardBody}>
          <QualificationFields
            boxed
            startIndex={2}
            before={
              <FormField
                control={control}
                name="client_type"
                label="1. Тип клиента"
                className={qualificationItemClass({ filled: !!clientType })}
              >
                {(field) => (
                  <Select
                    id={field.id}
                    allowClear
                    placeholder="—"
                    options={clientTypeOptions}
                    value={field.value}
                    onChange={(v) => field.onChange(v ?? null)}
                  />
                )}
              </FormField>
            }
            after={
              // МОП/МОС — в той же сетке, но в счёт квалификации не входят (как в прототипе)
              <>
                <FormField
                  control={control}
                  name="mop_id"
                  label="МОП по сделке"
                  className={qualificationItemClass({ accent: true })}
                >
                  {(field) => (
                    <UserSelect
                      id={field.id}
                      role="mop"
                      value={field.value}
                      onChange={field.onChange}
                      fallbackLabel={mop?.name}
                    />
                  )}
                </FormField>
                <FormField
                  control={control}
                  name="mos_id"
                  label="МОС по сделке"
                  className={qualificationItemClass({ accent: true })}
                >
                  {(field) => (
                    <UserSelect
                      id={field.id}
                      role="mos"
                      value={field.value}
                      onChange={field.onChange}
                      fallbackLabel={mos?.name}
                    />
                  )}
                </FormField>
              </>
            }
          />
        </div>
      )}
    </section>
  );
}

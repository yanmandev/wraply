import { useState } from 'react';
import { Button, Select, Tooltip } from 'antd';
import clsx from 'clsx';
import { dealStatusOptions, type DealStatus } from '@shared/constants/deal';
import { useUsers } from '@shared/api/user';
import type { DealPreset } from '@shared/api/deal';
import type { DealsFilters } from '../../useDealsFilters';
import s from './DealsHeader.module.less';

type Draft = Pick<DealsFilters, 'preset' | 'status' | 'mop_id'>;

const PRESETS: { key: DealPreset | 'rek'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'work', label: 'В работе' },
  { key: 'rek', label: 'С рекламацией' },
  { key: 'closed', label: 'Закрывающие' },
];

interface Props {
  value: Draft;
  onApply: (value: Draft) => void;
}

/** Содержимое поповера фильтра: правим черновик, применяем по «Найти» */
export function FilterPopover({ value, onApply }: Props) {
  const [draft, setDraft] = useState<Draft>(value);
  const managers = useUsers('mop');

  return (
    <div className={s.filter}>
      <div className={s.presets}>
        {PRESETS.map((p) =>
          p.key === 'rek' ? (
            <Tooltip key={p.key} title="Появится вместе с рекламациями">
              <button type="button" className={s.preset} disabled>
                {p.label}
              </button>
            </Tooltip>
          ) : (
            <button
              key={p.key}
              type="button"
              className={clsx(s.preset, draft.preset === p.key && s.presetOn)}
              onClick={() => setDraft((d) => ({ ...d, preset: p.key as DealPreset }))}
            >
              {p.label}
            </button>
          ),
        )}
      </div>

      <label className={s.field}>
        <b>Менеджер</b>
        <Select
          allowClear
          placeholder="любой"
          loading={managers.isLoading}
          value={draft.mop_id}
          onChange={(mop_id?: number) => setDraft((d) => ({ ...d, mop_id }))}
          options={managers.data?.map((u) => ({ value: u.id, label: u.name || u.email }))}
          showSearch={{ optionFilterProp: 'label' }}
          notFoundContent={managers.isError ? 'Не удалось загрузить' : undefined}
        />
      </label>

      <label className={s.field}>
        <b>Стадия</b>
        <Select
          allowClear
          placeholder="любая"
          value={draft.status}
          onChange={(status?: DealStatus) => setDraft((d) => ({ ...d, status }))}
          options={dealStatusOptions}
        />
      </label>

      <div className={s.filterFoot}>
        <Button onClick={() => onApply({ preset: 'all', status: undefined, mop_id: undefined })}>
          Сбросить
        </Button>
        <Button type="primary" onClick={() => onApply(draft)}>
          🔍 Найти
        </Button>
      </div>
    </div>
  );
}

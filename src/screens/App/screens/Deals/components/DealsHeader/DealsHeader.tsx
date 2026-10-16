import { useEffect, useState } from 'react';
import { Button, Input, Popover, Segmented, Tooltip } from 'antd';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { PageHeader, PageTitle } from '@app/shared/components/Page';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import type { DealsFilters, DealsView } from '../../useDealsFilters';
import { FilterPopover } from './FilterPopover';
import s from './DealsHeader.module.less';

interface Props {
  filters: DealsFilters;
  hasFilters: boolean;
  onChange: (patch: Partial<DealsFilters>) => void;
}

const VIEW_OPTIONS: { value: DealsView; label: string }[] = [
  { value: 'list', label: 'Список' },
  { value: 'kanban', label: 'Канбан' },
];

/** Шапка реестра сделок (по прототипу .ds-head) */
export function DealsHeader({ filters, hasFilters, onChange }: Props) {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);

  // Поиск: пишем в поле сразу, в URL/запрос — с задержкой
  const [search, setSearch] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(search);
  useEffect(() => {
    if (debouncedSearch !== filters.search) onChange({ search: debouncedSearch });
  }, [debouncedSearch, filters.search, onChange]);

  return (
    <PageHeader>
      <PageTitle>Сделки</PageTitle>

      <Segmented<DealsView>
        className={s.views}
        options={VIEW_OPTIONS}
        value={filters.view}
        onChange={(view) => onChange({ view, page: filters.page })}
      />

      <div className={s.right}>
        <Input
          className={s.search}
          allowClear
          placeholder="поиск по сделкам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Popover
          trigger="click"
          placement="bottomRight"
          open={filterOpen}
          onOpenChange={setFilterOpen}
          destroyOnHidden
          content={
            <FilterPopover
              value={{ preset: filters.preset, status: filters.status, mop_id: filters.mop_id }}
              onApply={(draft) => {
                onChange(draft);
                setFilterOpen(false);
              }}
            />
          }
        >
          <Tooltip title="Фильтр" placement="bottom">
            <button
              type="button"
              className={clsx(s.filterBtn, hasFilters && s.filterBtnOn)}
              aria-label="Фильтр"
              aria-pressed={hasFilters}
            >
              ⚙
            </button>
          </Tooltip>
        </Popover>

        <Button type="primary" onClick={() => navigate('/deals/new')}>
          + Новая сделка
        </Button>
      </div>
    </PageHeader>
  );
}

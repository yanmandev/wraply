import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { DEAL_STATUSES, type DealStatus } from '@shared/constants/deal';
import type { DealListParams, DealPreset } from '@shared/api/deal';

export type DealsView = 'list' | 'kanban';

export interface DealsFilters {
  view: DealsView;
  search: string;
  preset: DealPreset;
  status?: DealStatus;
  mop_id?: number;
  page: number;
}

const PRESETS: DealPreset[] = ['all', 'work', 'closed'];

/** Фильтры реестра живут в URL — ссылкой можно поделиться, «Назад» работает */
export function useDealsFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<DealsFilters>(() => {
    const status = params.get('status') as DealStatus | null;
    const preset = params.get('preset') as DealPreset | null;
    const mop = Number(params.get('mop'));
    return {
      view: params.get('view') === 'kanban' ? 'kanban' : 'list',
      search: params.get('q') ?? '',
      preset: preset && PRESETS.includes(preset) ? preset : 'all',
      status: status && DEAL_STATUSES.includes(status) ? status : undefined,
      mop_id: mop > 0 ? mop : undefined,
      page: Math.max(1, Number(params.get('page')) || 1),
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<DealsFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const set = (key: string, value: string | number | undefined, empty?: string) => {
            if (value === undefined || value === '' || value === empty) next.delete(key);
            else next.set(key, String(value));
          };
          if ('view' in patch) set('view', patch.view, 'list');
          if ('search' in patch) set('q', patch.search);
          if ('preset' in patch) set('preset', patch.preset, 'all');
          if ('status' in patch) set('status', patch.status);
          if ('mop_id' in patch) set('mop', patch.mop_id);
          // любая смена фильтра возвращает на первую страницу
          set('page', 'page' in patch ? patch.page : undefined, '1');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const apiParams: DealListParams = {
    search: filters.search,
    preset: filters.preset,
    status: filters.status,
    mop_id: filters.mop_id,
    page: filters.page,
  };

  /** Есть ли фильтры из поповера (для подсветки кнопки) */
  const hasFilters = filters.preset !== 'all' || !!filters.status || !!filters.mop_id;

  return { filters, update, apiParams, hasFilters };
}

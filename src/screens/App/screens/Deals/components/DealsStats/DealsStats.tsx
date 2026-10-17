import { useMemo } from 'react';
import clsx from 'clsx';
import type { DealStatus } from '@shared/constants/deal';
import { useDealStats } from '@shared/api/deal';
import { useUiStore } from '@shared/stores/useUiStore';
import { computeStats, getPeriods } from './computeStats';
import { StatTile } from './StatTile';
import { StageBars } from './StageBars';
import { WeeklyColumns } from './WeeklyColumns';
import s from './DealsStats.module.less';

interface Props {
  /** Сводка учитывает только фильтр по менеджеру — поиск и пресеты на цифры не влияют */
  mopId?: number;
  status?: DealStatus;
  onStatusSelect: (status: DealStatus | undefined) => void;
}

/** Сводка над реестром сделок: ключевые цифры, этапы, новые по неделям. Сворачивается */
export function DealsStats({ mopId, status, onStatusSelect }: Props) {
  const open = useUiStore((st) => st.dealsStatsOpen);
  const toggle = useUiStore((st) => st.toggleDealsStats);

  // границы периодов считаем раз за монтирование — иначе ключ запроса менялся бы каждый рендер
  const periods = useMemo(() => getPeriods(), []);
  const { data, isError, isFetching, isPlaceholderData } = useDealStats({
    mop_id: mopId,
    since: periods.since,
  });
  const view = useMemo(() => (data ? computeStats(data, periods) : null), [data, periods]);

  return (
    <section className={clsx(s.card, !open && s.closed)} aria-label="Сводка по сделкам">
      <button type="button" className={s.head} aria-expanded={open} onClick={toggle}>
        <h2>Сводка</h2>
        {view && !open && (
          <span className={s.headSummary}>
            в работе {view.inWork} · новых за месяц {view.newThisMonth} · завершено за месяц{' '}
            {view.completedThisMonth}
          </span>
        )}
        <span className={clsx(s.chev, open && s.chevOpen)} aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className={clsx(s.body, (isFetching || isPlaceholderData) && s.stale)}>
          {isError && !view ? (
            <p className={s.unavailable}>
              Статистика недоступна — проверьте эндпоинт deal_stats в Xano.
            </p>
          ) : !view ? (
            <div className={s.loading} aria-busy />
          ) : (
            <>
              <div className={s.tiles}>
                <StatTile
                  label="В работе"
                  value={view.inWork}
                  note={`+${view.newLast7} за 7 дней`}
                />
                <StatTile
                  label="Новые за месяц"
                  value={view.newThisMonth}
                  delta={{
                    value: view.newThisMonth - view.newPrevSame,
                    period: 'к прошлому месяцу',
                  }}
                />
                <StatTile
                  label="Завершено за месяц"
                  value={view.completedThisMonth}
                  delta={{
                    value: view.completedThisMonth - view.completedPrevSame,
                    period: 'к прошлому месяцу',
                  }}
                />
                <StatTile
                  label="Всего сделок"
                  value={view.total}
                  note={`${view.completedShare}% завершено`}
                />
              </div>
              <StageBars
                stages={view.stages}
                total={view.total}
                selected={status}
                onSelect={onStatusSelect}
              />
              <WeeklyColumns weeks={view.weeks} />
            </>
          )}
        </div>
      )}
    </section>
  );
}

import { DEAL_STATUSES, type DealStatus } from '@shared/constants/deal';
import type { DealStatsResponse } from '@shared/api/deal';
import { dayjs } from '@shared/lib/date';

export const WEEKS = 12;

/** Статусы «закрытия» — всё до них считается «в работе» (как пресет «В работе» в фильтре) */
const CLOSING: DealStatus[] = ['closing_docs', 'completed'];

/** Границы периодов в часовом поясе пользователя (dayjs локаль ru → неделя с понедельника) */
export function getPeriods(now = dayjs()) {
  const weekStart = now.startOf('week');
  const firstWeek = weekStart.subtract(WEEKS - 1, 'week');
  const monthStart = now.startOf('month');
  const prevMonthStart = monthStart.subtract(1, 'month');
  // та же длительность в прошлом месяце — честное сравнение неполного месяца
  const prevSameEnd = prevMonthStart.add(now.diff(monthStart), 'millisecond');
  return {
    now,
    firstWeek,
    monthStart,
    prevMonthStart,
    prevSameEnd,
    since: Math.min(firstWeek.valueOf(), prevMonthStart.valueOf()),
  };
}

export type Periods = ReturnType<typeof getPeriods>;

const countBetween = (list: number[], from: dayjs.Dayjs, to: dayjs.Dayjs) =>
  list.filter((t) => t >= from.valueOf() && t < to.valueOf()).length;

export interface WeekBucket {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  count: number;
  current: boolean;
}

export interface DealsStatsView {
  total: number;
  inWork: number;
  newLast7: number;
  newThisMonth: number;
  newPrevSame: number;
  completedThisMonth: number;
  completedPrevSame: number;
  completedShare: number;
  stages: { status: DealStatus; count: number }[];
  weeks: WeekBucket[];
}

export function computeStats(data: DealStatsResponse, p: Periods): DealsStatsView {
  const stages = DEAL_STATUSES.map((status) => ({ status, count: data.by_status[status] ?? 0 }));
  const total = stages.reduce((sum, s) => sum + s.count, 0);
  const inWork = stages
    .filter((s) => !CLOSING.includes(s.status))
    .reduce((sum, s) => sum + s.count, 0);
  const completed = data.by_status.completed ?? 0;

  const weeks: WeekBucket[] = Array.from({ length: WEEKS }, (_, i) => {
    const start = p.firstWeek.add(i, 'week');
    const end = start.add(1, 'week');
    return { start, end, count: countBetween(data.created, start, end), current: i === WEEKS - 1 };
  });

  return {
    total,
    inWork,
    newLast7: countBetween(data.created, p.now.subtract(7, 'day'), p.now.add(1, 'minute')),
    newThisMonth: countBetween(data.created, p.monthStart, p.now.add(1, 'minute')),
    newPrevSame: countBetween(data.created, p.prevMonthStart, p.prevSameEnd),
    completedThisMonth: countBetween(data.completed, p.monthStart, p.now.add(1, 'minute')),
    completedPrevSame: countBetween(data.completed, p.prevMonthStart, p.prevSameEnd),
    completedShare: total ? Math.round((completed / total) * 100) : 0,
    stages,
    weeks,
  };
}

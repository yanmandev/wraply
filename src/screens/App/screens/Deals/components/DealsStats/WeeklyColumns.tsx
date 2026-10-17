import { Tooltip } from 'antd';
import clsx from 'clsx';
import type { WeekBucket } from './computeStats';
import s from './DealsStats.module.less';

const fmt = (w: WeekBucket) =>
  `${w.start.format('DD.MM')}–${w.end.subtract(1, 'day').format('DD.MM')}`;

/** «Чистая» верхняя граница оси: 1, 2, 5, 10, 20, 50… */
function niceMax(n: number) {
  if (n <= 5) return Math.max(1, n);
  const pow = 10 ** Math.floor(Math.log10(n));
  return [1, 2, 5, 10].map((k) => k * pow).find((v) => v >= n) ?? n;
}

/**
 * Новые сделки по неделям: столбцы одного цвета, прошлые недели приглушены,
 * текущая — акцентом. Подпись значения — только у текущей недели, остальное в подсказке.
 */
export function WeeklyColumns({ weeks }: { weeks: WeekBucket[] }) {
  const top = niceMax(Math.max(...weeks.map((w) => w.count)));
  const current = weeks[weeks.length - 1];

  return (
    <div className={s.chart}>
      <h3 className={s.chartTitle}>
        Новые по неделям
        <span>за {weeks.length} недель</span>
      </h3>

      <div className={s.columnsPlot}>
        <div className={s.yAxis} aria-hidden>
          <span>{top}</span>
          <span>0</span>
        </div>
        <div className={s.columns}>
          {weeks.map((w) => (
            <Tooltip key={w.start.valueOf()} title={`${fmt(w)}: ${w.count}`} mouseEnterDelay={0.1}>
              <div className={s.colSlot} tabIndex={0} aria-label={`${fmt(w)}: ${w.count}`}>
                {w.current && <span className={s.colValue}>{w.count}</span>}
                <i
                  className={clsx(s.col, w.current && s.colCurrent)}
                  style={{ height: `${(w.count / top) * 100}%` }}
                />
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className={s.xAxis} aria-hidden>
        <span>{weeks[0].start.format('DD.MM')}</span>
        <span>{weeks[Math.floor(weeks.length / 2)].start.format('DD.MM')}</span>
        <span>эта неделя</span>
      </div>

      <table className={s.srOnly}>
        <caption>Новые сделки по неделям</caption>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.start.valueOf()}>
              <th scope="row">{fmt(w)}</th>
              <td>{w.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className={s.srOnly}>На этой неделе: {current.count}</span>
    </div>
  );
}

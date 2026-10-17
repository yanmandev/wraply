import { Tooltip } from 'antd';
import clsx from 'clsx';
import { DEAL_STATUS_LABEL, type DealStatus } from '@shared/constants/deal';
import s from './DealsStats.module.less';

interface Props {
  stages: { status: DealStatus; count: number }[];
  total: number;
  /** выбранный в фильтре этап — подсвечиваем, остальные приглушаем */
  selected?: DealStatus;
  onSelect: (status: DealStatus | undefined) => void;
}

/**
 * Сделки по этапам воронки: горизонтальные столбики одного цвета.
 * Этапы упорядочены, их называют подписи — цвет не нужен для различения (11 цветов не различить).
 * Клик по этапу ставит/снимает фильтр по нему.
 */
export function StageBars({ stages, total, selected, onSelect }: Props) {
  const max = Math.max(1, ...stages.map((st) => st.count));

  return (
    <div className={s.chart}>
      <h3 className={s.chartTitle}>По этапам</h3>
      <ul className={s.stages}>
        {stages.map(({ status, count }) => {
          const share = total ? Math.round((count / total) * 100) : 0;
          return (
            <li key={status}>
              <Tooltip
                title={`${DEAL_STATUS_LABEL[status]}: ${count} (${share}%)`}
                placement="top"
                mouseEnterDelay={0.2}
              >
                <button
                  type="button"
                  className={clsx(
                    s.stage,
                    selected && (selected === status ? s.stageOn : s.stageDim),
                  )}
                  aria-pressed={selected === status}
                  onClick={() => onSelect(selected === status ? undefined : status)}
                >
                  <span className={s.stageLabel}>{DEAL_STATUS_LABEL[status]}</span>
                  <span className={s.track}>
                    {count > 0 && (
                      <i className={s.bar} style={{ width: `${(count / max) * 100}%` }} />
                    )}
                  </span>
                  <span className={s.stageValue}>{count}</span>
                </button>
              </Tooltip>
            </li>
          );
        })}
      </ul>

      {/* табличный двойник для экранного диктора */}
      <table className={s.srOnly}>
        <caption>Сделки по этапам</caption>
        <tbody>
          {stages.map(({ status, count }) => (
            <tr key={status}>
              <th scope="row">{DEAL_STATUS_LABEL[status]}</th>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

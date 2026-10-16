import { DEAL_STATUS_COLOR, DEAL_STATUS_LABEL, type DealStatus } from '@shared/constants/deal';
import s from './DealStatusTag.module.less';

/** Этап сделки: цветная точка + подпись (цвета этапов из прототипа) */
export function DealStatusTag({ status }: { status: DealStatus }) {
  return (
    <span className={s.tag}>
      <i style={{ background: DEAL_STATUS_COLOR[status] }} />
      {DEAL_STATUS_LABEL[status]}
    </span>
  );
}

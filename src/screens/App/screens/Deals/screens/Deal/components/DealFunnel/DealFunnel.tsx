import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { DEAL_STATUS_LABEL, DEAL_STATUSES, type DealStatus } from '@shared/constants/deal';
import s from './DealFunnel.module.less';

// Последний статус (completed) — отдельная кнопка «Завершить сделку» в конце воронки
const STAGES = DEAL_STATUSES.filter((st) => st !== 'completed');

interface Props {
  status: DealStatus;
  /** идёт сохранение — кнопки неактивны */
  pending?: boolean;
  onChange: (status: DealStatus) => void;
}

/** Воронка этапов сделки (по прототипу .funnel): клик по этапу меняет статус */
export function DealFunnel({ status, pending, onChange }: Props) {
  const current = DEAL_STATUSES.indexOf(status);
  const completed = status === 'completed';
  const ref = useRef<HTMLDivElement>(null);

  // На узком экране воронка прокручивается — держим текущий этап в поле зрения
  // (scrollLeft, а не scrollIntoView — тот прокручивает ещё и страницу)
  useEffect(() => {
    const box = ref.current;
    const el = box?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (box && el) box.scrollLeft = el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2;
  }, [status]);

  const select = (next: DealStatus) => {
    if (next !== status && !pending) onChange(next);
  };

  return (
    <div ref={ref} className={s.funnel} role="tablist" aria-label="Этапы сделки">
      {STAGES.map((st, i) => (
        <button
          key={st}
          type="button"
          role="tab"
          aria-selected={st === status}
          disabled={pending}
          title={DEAL_STATUS_LABEL[st]}
          className={clsx(s.step, i === current ? s.now : i > current && s.future)}
          onClick={() => select(st)}
        >
          {DEAL_STATUS_LABEL[st]}
        </button>
      ))}
      <button
        type="button"
        role="tab"
        aria-selected={completed}
        disabled={pending}
        className={clsx(s.step, s.finish, completed && s.done)}
        onClick={() => select('completed')}
      >
        {completed ? '✓ Сделка завершена' : 'Завершить сделку'}
      </button>
    </div>
  );
}

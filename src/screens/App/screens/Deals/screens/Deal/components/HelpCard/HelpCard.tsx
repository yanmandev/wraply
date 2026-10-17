import { useState } from 'react';
import { Tag } from 'antd';
import clsx from 'clsx';
import { DEAL_STATUS_LABEL, type DealStatus } from '@shared/constants/deal';
import { STAGE_HELP } from './helpContent';
import cardStyles from '../../Deal.module.less';
import s from './HelpCard.module.less';

const STAGES = Object.keys(STAGE_HELP) as (keyof typeof STAGE_HELP)[];

/** Справка по этапам: что делать, автоматизации, задачи, к кому идти. Свёрнута по умолчанию */
export function HelpCard({ status }: { status: DealStatus }) {
  const [open, setOpen] = useState(false);
  // Ручные раскрытия пунктов; без них раскрыт только текущий этап
  const [toggled, setToggled] = useState<Partial<Record<DealStatus, boolean>>>({});
  const isOpen = (st: DealStatus) => toggled[st] ?? st === status;

  return (
    <section className={clsx(cardStyles.card, cardStyles.collapsible, open && cardStyles.open)}>
      <div
        className={cardStyles.cardHead}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        <h2>Справка: этапы, автоматизации, регламент</h2>
        <span className={cardStyles.sub}>
          текущий этап: {status === 'completed' ? 'сделка завершена' : DEAL_STATUS_LABEL[status]}
        </span>
        <span className={clsx(cardStyles.chev, s.chevRight)} aria-hidden>
          ▾
        </span>
      </div>

      {open && (
        <div className={cardStyles.cardBody}>
          {STAGES.map((st, i) => {
            const help = STAGE_HELP[st];
            const itemOpen = isOpen(st);
            return (
              <div
                key={st}
                className={clsx(s.item, st === status && s.current, itemOpen && s.itemOpen)}
              >
                <button
                  type="button"
                  className={s.head}
                  aria-expanded={itemOpen}
                  onClick={() => setToggled((t) => ({ ...t, [st]: !itemOpen }))}
                >
                  <b>
                    {i + 1}. {DEAL_STATUS_LABEL[st]}
                  </b>
                  {st === status && <Tag color="blue">вы здесь</Tag>}
                  <span className={s.chev} aria-hidden>
                    ▾
                  </span>
                </button>
                {itemOpen && (
                  <div className={s.body}>
                    <h4>Что происходит и что делать</h4>
                    <p>{help.what}</p>
                    <h4>Автоматизации</h4>
                    <p className={s.auto}>⚡ {help.auto}</p>
                    <h4>Задачи</h4>
                    <p>{help.tasks}</p>
                    <h4>Кому писать</h4>
                    <p>
                      {help.who.map(([role, about]) => (
                        <span key={role} className={s.who}>
                          {role} — {about}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

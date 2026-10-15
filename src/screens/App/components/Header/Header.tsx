import { Fragment, type ReactNode } from 'react';
import clsx from 'clsx';
import s from './Header.module.less';

export interface HeaderStat {
  key: string;
  icon: ReactNode;
  /** значение выделяется жирным */
  value: ReactNode;
  label?: ReactNode;
  /** подпись слева от значения (как «Позиции 3») */
  prefix?: boolean;
}

export interface HeaderTab {
  key: string;
  label: string;
  /** Вкладки внутри переключателя (Смета/Заказ · КП) */
  group?: string;
}

export interface HeaderNote {
  text: string;
  ok?: boolean;
}

interface HeaderProps {
  title: ReactNode;
  stats?: HeaderStat[];
  tabs?: HeaderTab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  note?: HeaderNote;
  actions?: ReactNode;
}

/** Шапка страницы в стиле карточки сделки из прототипа */
export function Header({ title, stats, tabs, activeTab, onTabChange, note, actions }: HeaderProps) {
  const renderTab = (t: HeaderTab, cls: string) => (
    <button
      key={t.key}
      type="button"
      role="tab"
      className={cls}
      aria-selected={t.key === activeTab}
      onClick={() => onTabChange?.(t.key)}
    >
      {t.label}
    </button>
  );

  // Подряд идущие вкладки одной group собираются в переключатель
  const tabNodes: ReactNode[] = [];
  tabs?.forEach((t, i) => {
    if (!t.group) {
      tabNodes.push(renderTab(t, s.tab));
      return;
    }
    if (tabs[i - 1]?.group === t.group) return;
    const groupTabs: HeaderTab[] = [];
    for (let j = i; tabs[j]?.group === t.group; j++) groupTabs.push(tabs[j]);
    const groupActive = groupTabs.some((x) => x.key === activeTab);
    tabNodes.push(
      <div
        key={t.group}
        className={clsx(s.viewSwitch, !groupActive && s.dim)}
        role="tablist"
        aria-label={t.group}
      >
        {groupTabs.map((x) => renderTab(x, s.vsBtn))}
      </div>,
    );
  });

  return (
    <header className={s.header}>
      <div className={s.top}>
        <h1 className={s.title}>{title}</h1>

        {stats?.length ? (
          <div className={s.stats}>
            {stats.map((st, i) => (
              <Fragment key={st.key}>
                {i > 0 && <i />}
                <span className={s.stat}>
                  {st.icon}
                  {st.prefix && st.label}
                  <b>{st.value}</b>
                  {!st.prefix && st.label}
                </span>
              </Fragment>
            ))}
          </div>
        ) : null}

        {tabNodes.length > 0 && (
          <nav className={s.tabs} role="tablist">
            {tabNodes}
          </nav>
        )}

        {(note || actions) && (
          <div className={s.side}>
            {note && <span className={clsx(s.note, note.ok && s.noteOk)}>{note.text}</span>}
            {actions && <div className={s.actions}>{actions}</div>}
          </div>
        )}
      </div>
    </header>
  );
}

import type { ReactNode } from 'react';
import clsx from 'clsx';
import s from './Page.module.less';

/** Шапка экрана: липкая полоса во всю ширину. Содержимое задаёт сам экран */
export function PageHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={clsx(s.header, className)}>{children}</header>;
}

/** Заголовок экрана в шапке */
export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className={s.title}>{children}</h1>;
}

/** Тело экрана: отступы и ограничение ширины */
export function PageBody({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string;
  /** без ограничения ширины — для таблиц и канбана */
  wide?: boolean;
}) {
  return <div className={clsx(s.body, wide && s.wide, className)}>{children}</div>;
}

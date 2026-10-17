import type { ReactNode } from 'react';
import clsx from 'clsx';
import s from './DealsStats.module.less';

interface Props {
  label: string;
  value: number | string;
  /** изменение к прошлому периоду: число со знаком; рост — хорошо */
  delta?: { value: number; period: string };
  /** подпись под значением, если дельта не нужна */
  note?: ReactNode;
}

/** Плитка показателя: подпись · значение · дельта (стрелка + текст, не только цвет) */
export function StatTile({ label, value, delta, note }: Props) {
  const dir = delta ? Math.sign(delta.value) : 0;

  return (
    <div className={s.tile}>
      <span className={s.tileLabel}>{label}</span>
      <span className={s.tileValue}>{value}</span>
      {delta ? (
        <span className={clsx(s.tileDelta, dir > 0 && s.up, dir < 0 && s.down)}>
          {dir > 0 ? '▲' : dir < 0 ? '▼' : '='} {dir > 0 ? '+' : ''}
          {delta.value} {delta.period}
        </span>
      ) : (
        note && <span className={s.tileNote}>{note}</span>
      )}
    </div>
  );
}

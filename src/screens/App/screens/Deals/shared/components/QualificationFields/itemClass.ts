import clsx from 'clsx';
import s from './QualificationFields.module.less';

/** Класс ячейки сетки для доп. полей (before/after), чтобы они выглядели как вопросы */
export const qualificationItemClass = (opts: { filled?: boolean; accent?: boolean } = {}) =>
  clsx(s.item, opts.filled && s.filled, opts.accent && s.accent);

import { toOptions, type LabelMap } from './options';

export const USER_ROLES = ['admin', 'mop', 'mos'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABEL: LabelMap<UserRole> = {
  admin: 'Администратор',
  mop: 'МОП',
  mos: 'МОС',
};
export const userRoleOptions = toOptions(USER_ROLE_LABEL);

/* ═══ Статус учётной записи ═══ */

export const USER_STATUSES = ['active', 'inactive', 'archived'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABEL: LabelMap<UserStatus> = {
  active: 'Активный',
  inactive: 'Неактивный',
  archived: 'Архивный',
};

/** Пояснение для формы и подсказок */
export const USER_STATUS_HINT: LabelMap<UserStatus> = {
  active: 'Работает в системе',
  inactive: 'Доступ временно ограничен',
  archived: 'Больше не нужен, вход закрыт',
};

/** Цвет тега antd */
export const USER_STATUS_COLOR: LabelMap<UserStatus> = {
  active: 'green',
  inactive: 'orange',
  archived: 'default',
};

export const userStatusOptions = toOptions(USER_STATUS_LABEL);

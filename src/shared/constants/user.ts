import { toOptions, type LabelMap } from './options';

export const USER_ROLES = ['admin', 'mop', 'mos'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABEL: LabelMap<UserRole> = {
  admin: 'Администратор',
  mop: 'МОП',
  mos: 'МОС',
};
export const userRoleOptions = toOptions(USER_ROLE_LABEL);

import type { ComponentType, SVGProps } from 'react';
import { ChatsIcon, DealsIcon, DiskIcon, KbIcon, LeadsIcon, ProfileIcon, TasksIcon } from './icons';

export interface MenuLink {
  key: string;
  label: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Разделы в верхней части меню (порядок как в прототипе) */
export const mainLinks: MenuLink[] = [
  { key: 'leads', label: 'Лиды', path: '/leads', icon: LeadsIcon },
  { key: 'deals', label: 'Сделки', path: '/deals', icon: DealsIcon },
  { key: 'tasks', label: 'Задачи', path: '/tasks', icon: TasksIcon },
  { key: 'chats', label: 'Чаты', path: '/chats', icon: ChatsIcon },
  { key: 'disk', label: 'Диск', path: '/disk', icon: DiskIcon },
  { key: 'kb', label: 'База знаний', path: '/kb', icon: KbIcon },
];

export const profileLink: MenuLink = {
  key: 'profile',
  label: 'Настройки профиля',
  path: '/profile',
  icon: ProfileIcon,
};

import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { Tooltip } from 'antd';
import { toast } from 'sonner';
import NiceModal from '@ebay/nice-modal-react';
import clsx from 'clsx';
import { THEME_LABEL, useUiStore } from '@shared/stores/useUiStore';
import { useUserStore } from '@shared/stores/useUserStore';
import { ConfirmModal } from '@shared/components/ConfirmModal';
import { mainLinks, profileLink, type MenuLink } from './menuItems';
import { CollapseIcon, ExitIcon, ExpandIcon, ThemeIcon } from './icons';
import s from './MainMenu.module.less';

export function MainMenu() {
  const expanded = useUiStore((st) => st.menuExpanded);
  const toggleMenu = useUiStore((st) => st.toggleMenu);
  const nextTheme = useUiStore((st) => st.nextTheme);
  const logout = useUserStore((st) => st.logout);

  const onTheme = () => toast(`Тема: ${THEME_LABEL[nextTheme()]}`);

  const onExit = async () => {
    const ok = await NiceModal.show(ConfirmModal, {
      title: 'Выйти из аккаунта?',
      okText: 'Выйти',
      danger: true,
    });
    if (ok) logout();
  };

  // Подсказка нужна только в свёрнутом виде, когда подписи скрыты
  const withTip = (label: string, node: ReactNode) =>
    expanded ? (
      node
    ) : (
      <Tooltip title={label} placement="right" mouseEnterDelay={0.3}>
        {node}
      </Tooltip>
    );

  const renderLink = ({ key, label, path, icon: Icon }: MenuLink) => (
    <li key={key}>
      {withTip(
        label,
        <NavLink to={path} className={({ isActive }) => clsx(s.item, isActive && s.active)}>
          <Icon className={s.icon} />
          <span className={s.label}>{label}</span>
        </NavLink>,
      )}
    </li>
  );

  const renderAction = (label: string, Icon: typeof ExitIcon, onClick: () => void) =>
    withTip(
      label,
      <button type="button" className={s.item} onClick={onClick}>
        <Icon className={s.icon} />
        <span className={s.label}>{label}</span>
      </button>,
    );

  return (
    <nav className={clsx(s.rail, expanded && s.expanded)} aria-label="Основное меню">
      <div className={s.top}>
        <Link to="/" className={s.logo} aria-label="На главную">
          <span className={s.logoMark}>W</span>
          <span className={s.label}>Wraply CRM</span>
        </Link>
        {withTip(
          'Развернуть меню',
          <button
            type="button"
            className={clsx(s.item, s.toggle)}
            onClick={toggleMenu}
            aria-expanded={expanded}
            aria-label={expanded ? 'Свернуть меню' : 'Развернуть меню'}
          >
            {expanded ? <CollapseIcon className={s.icon} /> : <ExpandIcon className={s.icon} />}
            <span className={s.label}>Свернуть</span>
          </button>,
        )}
      </div>

      <ul className={s.list}>{mainLinks.map(renderLink)}</ul>

      <span className={s.spacer} />

      <ul className={s.list}>
        {renderLink(profileLink)}
        <li>{renderAction('Тема: день / ночь / неон', ThemeIcon, onTheme)}</li>
      </ul>
      <span className={s.sep} />
      {renderAction('Выход', ExitIcon, onExit)}
    </nav>
  );
}

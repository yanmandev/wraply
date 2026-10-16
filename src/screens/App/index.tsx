import { Outlet } from 'react-router';
import clsx from 'clsx';
import { useUiStore } from '@shared/stores/useUiStore';
import { MainMenu } from './components/MainMenu';
import s from './App.module.less';

/**
 * Каркас CRM для вошедшего пользователя: главное меню + экран.
 * Шапку и тело экран рисует сам через PageHeader / PageBody — у каждого раздела своя шапка.
 */
export default function App() {
  const menuExpanded = useUiStore((st) => st.menuExpanded);

  return (
    <div className={clsx(s.app, menuExpanded && s.menuExpanded)}>
      <MainMenu />
      <main className={s.content}>
        <Outlet />
      </main>
    </div>
  );
}

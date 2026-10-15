import { Outlet } from 'react-router';
import clsx from 'clsx';
import { useUiStore } from '@shared/stores/useUiStore';
import { MainMenu } from './components/MainMenu';
import { DemoDealHeader } from './components/DemoDealHeader';
import s from './App.module.less';

/** Каркас CRM для вошедшего пользователя: главное меню + шапка + контент экрана */
export default function App() {
  const menuExpanded = useUiStore((st) => st.menuExpanded);

  return (
    <div className={clsx(s.app, menuExpanded && s.menuExpanded)}>
      <MainMenu />
      <div className={s.content}>
        <DemoDealHeader />
        <main className={s.page}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

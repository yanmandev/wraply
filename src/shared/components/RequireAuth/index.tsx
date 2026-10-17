import { Navigate, Outlet, useLocation } from 'react-router';
import { selectIsAuthed, useUserStore } from '@shared/stores/useUserStore';
import { useSessionCheck } from './useSessionCheck';

/** Пускает в дочерние маршруты только вошедшего пользователя с активной учётной записью */
export function RequireAuth() {
  const isAuthed = useUserStore(selectIsAuthed);
  const location = useLocation();
  useSessionCheck();

  // запоминаем, куда шёл пользователь, чтобы вернуть его туда после входа
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

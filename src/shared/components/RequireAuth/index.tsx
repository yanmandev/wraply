import { Navigate, Outlet } from 'react-router';
import { useUserStore } from '@shared/stores/useUserStore';

/** Пускает в дочерние маршруты только вошедшего пользователя */
export function RequireAuth() {
  const user = useUserStore((s) => s.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

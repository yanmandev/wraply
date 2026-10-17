import { Button, Result } from 'antd';
import { Link, Outlet } from 'react-router';
import type { UserRole } from '@shared/constants/user';
import { useUserStore } from '@shared/stores/useUserStore';

/** Пускает в дочерние маршруты только пользователя с нужной ролью, иначе — «Нет доступа» */
export function RequireRole({ role }: { role: UserRole }) {
  const userRole = useUserStore((s) => s.user?.role);

  if (userRole === role) return <Outlet />;

  return (
    <Result
      status="403"
      title="Нет доступа"
      subTitle="Раздел доступен только администратору."
      extra={
        <Link to="/">
          <Button type="primary">На главную</Button>
        </Link>
      }
    />
  );
}

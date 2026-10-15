import { Button } from 'antd';
import { Navigate } from 'react-router';
import { TEST_USER, useUserStore } from '@shared/stores/useUserStore';
import s from './Login.module.less';

/** Заглушка входа: до подключения Xano входим тестовым пользователем */
export default function Login() {
  const user = useUserStore((st) => st.user);
  const setSession = useUserStore((st) => st.setSession);

  if (user) return <Navigate to="/" replace />;

  return (
    <div className={s.wrap}>
      <div className={s.card}>
        <h1>Wraply CRM</h1>
        <p>Авторизация пока не подключена</p>
        <Button type="primary" size="large" block onClick={() => setSession(TEST_USER, '')}>
          Войти как {TEST_USER.name}
        </Button>
      </div>
    </div>
  );
}

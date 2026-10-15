import { Alert, Button, Form, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, type Location } from 'react-router';
import { loginSchema, type LoginPayload } from '@shared/api/auth';
import { getErrorMessage } from '@shared/api/http';
import { selectIsAuthed, useUserStore } from '@shared/stores/useUserStore';
import { useLogin } from './useLogin';
import s from './Login.module.less';

export default function Login() {
  const isAuthed = useUserStore(selectIsAuthed);
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthed) {
    const to = from ? `${from.pathname}${from.search}${from.hash}` : '/';
    return <Navigate to={to} replace />;
  }

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <div className={s.wrap}>
      <form className={s.card} onSubmit={onSubmit} noValidate>
        <div className={s.brand}>
          <span className={s.logoMark}>W</span>
          <h1>Wraply CRM</h1>
        </div>
        <p className={s.hint}>Войдите, чтобы продолжить</p>

        {login.isError && (
          <Alert className={s.alert} type="error" showIcon title={getErrorMessage(login.error)} />
        )}

        <Form component={false} layout="vertical" requiredMark={false}>
          <Form.Item
            label="Email"
            htmlFor="login-email"
            validateStatus={errors.email ? 'error' : undefined}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  size="large"
                  autoComplete="username"
                  autoFocus
                  placeholder="name@company.ru"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Пароль"
            htmlFor="login-password"
            validateStatus={errors.password ? 'error' : undefined}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id="login-password"
                  size="large"
                  autoComplete="current-password"
                  placeholder="Пароль"
                />
              )}
            />
          </Form.Item>
        </Form>

        <Button type="primary" htmlType="submit" size="large" block loading={login.isPending}>
          Войти
        </Button>
      </form>
    </div>
  );
}

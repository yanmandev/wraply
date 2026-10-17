import { Descriptions, Tag } from 'antd';
import {
  USER_ROLE_LABEL,
  USER_STATUS_COLOR,
  USER_STATUS_HINT,
  USER_STATUS_LABEL,
} from '@shared/constants/user';
import { formatDate } from '@shared/lib/date';
import { userDisplayName, userInitials } from '@shared/lib/user';
import { useUserStore } from '@shared/stores/useUserStore';
import { PageBody, PageHeader, PageTitle } from '@app/shared/components/Page';
import s from './Profile.module.less';

/**
 * Профиль текущего пользователя — только просмотр.
 * Данные из store; их обновляет проверка сессии (auth/me), так что изменения администратора видны.
 */
export default function Profile() {
  const user = useUserStore((st) => st.user);
  if (!user) return null; // сюда пускает только RequireAuth

  const status = user.status ?? 'active';

  return (
    <>
      <PageHeader>
        <PageTitle>Профиль</PageTitle>
      </PageHeader>

      <PageBody className={s.body}>
        <section className={s.card}>
          <div className={s.head}>
            <span className={s.avatar}>{userInitials(user)}</span>
            <div className={s.who}>
              <h2>{userDisplayName(user)}</h2>
              <span>{user.email}</span>
            </div>
            {user.role && (
              <Tag className={s.role} color={user.role === 'admin' ? 'purple' : 'blue'}>
                {USER_ROLE_LABEL[user.role]}
              </Tag>
            )}
          </div>

          <Descriptions
            className={s.details}
            column={{ xs: 1, sm: 2 }}
            items={[
              { key: 'first', label: 'Имя', children: user.first_name || '—' },
              { key: 'last', label: 'Фамилия', children: user.last_name || '—' },
              { key: 'email', label: 'Email (логин)', children: user.email },
              {
                key: 'role',
                label: 'Роль',
                children: user.role ? USER_ROLE_LABEL[user.role] : '—',
              },
              {
                key: 'status',
                label: 'Статус',
                children: (
                  <span className={s.status}>
                    <Tag color={USER_STATUS_COLOR[status]}>{USER_STATUS_LABEL[status]}</Tag>
                    <span>{USER_STATUS_HINT[status]}</span>
                  </span>
                ),
              },
              {
                key: 'created',
                label: 'В системе с',
                children: user.created_at ? formatDate(user.created_at) : '—',
              },
            ]}
          />

          <p className={s.note}>Чтобы изменить данные или пароль, обратитесь к администратору.</p>
        </section>
      </PageBody>
    </>
  );
}

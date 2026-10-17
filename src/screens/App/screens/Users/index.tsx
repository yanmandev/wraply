import { useState } from 'react';
import { Button, Input, Segmented, Select } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import { userRoleOptions, type UserRole, type UserStatus } from '@shared/constants/user';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { PageBody, PageHeader, PageTitle } from '@app/shared/components/Page';
import { UsersTable } from './components/UsersTable';
import { UserModal } from './components/UserModal';
import s from './Users.module.less';

type StatusFilter = UserStatus | 'all';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'inactive', label: 'Неактивные' },
  { value: 'archived', label: 'Архив' },
];

/** Управление пользователями (только для администратора — см. RequireRole в routes) */
export default function Users() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [role, setRole] = useState<UserRole>();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  // любая смена фильтра — на первую страницу
  const filter =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  return (
    <>
      <PageHeader>
        <PageTitle>Пользователи</PageTitle>
        <Segmented<StatusFilter>
          className={s.statusFilter}
          options={STATUS_FILTERS}
          value={status}
          onChange={filter(setStatus)}
        />
        <div className={s.headRight}>
          <Select<UserRole>
            className={s.roleSelect}
            allowClear
            placeholder="Любая роль"
            options={userRoleOptions}
            value={role}
            onChange={filter(setRole)}
          />
          <Input
            className={s.search}
            allowClear
            placeholder="поиск по имени или email..."
            value={search}
            onChange={(e) => filter(setSearch)(e.target.value)}
          />
          <Button type="primary" onClick={() => NiceModal.show(UserModal)}>
            + Пользователь
          </Button>
        </div>
      </PageHeader>

      <PageBody wide>
        <UsersTable
          params={{
            search: debouncedSearch,
            status: status === 'all' ? undefined : status,
            role,
            page,
          }}
          onPageChange={setPage}
        />
      </PageBody>
    </>
  );
}

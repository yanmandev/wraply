import {
  Alert,
  Button,
  Dropdown,
  Table,
  Tag,
  Tooltip,
  type MenuProps,
  type TableColumnsType,
} from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  USER_ROLE_LABEL,
  USER_STATUS_COLOR,
  USER_STATUS_HINT,
  USER_STATUS_LABEL,
  type UserStatus,
} from '@shared/constants/user';
import {
  useAdminUsers,
  usersApi,
  usersKeys,
  type AdminUser,
  type UserListParams,
} from '@shared/api/users';
import { getErrorMessage } from '@shared/api/http';
import { ConfirmModal } from '@shared/components/ConfirmModal';
import { formatDate } from '@shared/lib/date';
import { userDisplayName, userInitials } from '@shared/lib/user';
import { useUserStore } from '@shared/stores/useUserStore';
import { UserModal } from './UserModal';
import s from '../Users.module.less';

const PER_PAGE = 25;

/** Быстрая смена статуса из меню строки */
const STATUS_ACTIONS: { status: UserStatus; label: string }[] = [
  { status: 'active', label: 'Активировать' },
  { status: 'inactive', label: 'Ограничить доступ' },
  { status: 'archived', label: 'В архив' },
];

interface Props {
  params: UserListParams;
  onPageChange: (page: number) => void;
}

export function UsersTable({ params, onPageChange }: Props) {
  const queryClient = useQueryClient();
  const meId = useUserStore((st) => st.user?.id);
  const { data, isLoading, isFetching, isError, error } = useAdminUsers({
    ...params,
    per_page: PER_PAGE,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: usersKeys.all });
    queryClient.invalidateQueries({ queryKey: ['user', 'list'] }); // выбор МОП/МОС
  };

  const setStatus = useMutation({
    mutationFn: ({ user, status }: { user: AdminUser; status: UserStatus }) =>
      usersApi.update(user.id, {
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email,
        role: user.role ?? 'mop',
        status,
        password: null,
      }),
    onSuccess: (u) => {
      refresh();
      toast.success(
        `${userDisplayName(u)}: ${USER_STATUS_LABEL[u.status ?? 'active'].toLowerCase()}`,
      );
    },
  });

  const remove = useMutation({
    mutationFn: (user: AdminUser) => usersApi.remove(user.id),
    onSuccess: (_r, user) => {
      refresh();
      toast.success(`Пользователь ${userDisplayName(user)} удалён`);
    },
  });

  const edit = (user: AdminUser) => NiceModal.show(UserModal, { user, isSelf: user.id === meId });

  const confirmRemove = async (user: AdminUser) => {
    const ok = await NiceModal.show(ConfirmModal, {
      title: `Удалить ${userDisplayName(user)}?`,
      content:
        'Удаление необратимо. Если пользователь работал со сделками, удалить его нельзя — переведите в архив.',
      okText: 'Удалить',
      danger: true,
    });
    if (ok) remove.mutate(user);
  };

  const rowMenu = (user: AdminUser): MenuProps => {
    const isSelf = user.id === meId;
    return {
      items: [
        { key: 'edit', label: 'Изменить' },
        { type: 'divider' },
        ...STATUS_ACTIONS.filter((a) => a.status !== user.status).map((a) => ({
          key: `status:${a.status}`,
          label: a.label,
          disabled: isSelf,
        })),
        { type: 'divider' },
        { key: 'delete', label: 'Удалить', danger: true, disabled: isSelf },
      ],
      onClick: ({ key, domEvent }) => {
        domEvent.stopPropagation();
        if (key === 'edit') edit(user);
        if (key === 'delete') confirmRemove(user);
        if (key.startsWith('status:')) {
          setStatus.mutate({ user, status: key.slice(7) as UserStatus });
        }
      },
    };
  };

  const columns: TableColumnsType<AdminUser> = [
    {
      key: 'user',
      title: 'Пользователь',
      render: (_, u) => (
        <div className={s.user}>
          <span className={s.avatar}>{userInitials(u)}</span>
          <div className={s.userText}>
            <b>
              {userDisplayName(u)}
              {u.id === meId && <span className={s.me}> (вы)</span>}
            </b>
            <span>{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Роль',
      dataIndex: 'role',
      width: 170,
      render: (role: AdminUser['role']) =>
        role ? (
          <Tag color={role === 'admin' ? 'purple' : 'blue'}>{USER_ROLE_LABEL[role]}</Tag>
        ) : (
          <span className={s.muted}>—</span>
        ),
    },
    {
      key: 'status',
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status: AdminUser['status']) => {
        const st = status ?? 'active';
        return (
          <Tooltip title={USER_STATUS_HINT[st]}>
            <Tag color={USER_STATUS_COLOR[st]}>{USER_STATUS_LABEL[st]}</Tag>
          </Tooltip>
        );
      },
    },
    {
      key: 'created',
      title: 'Создан',
      dataIndex: 'created_at',
      width: 120,
      render: (v: number) => formatDate(v),
    },
    {
      key: 'actions',
      width: 56,
      align: 'right',
      render: (_, u) => (
        // Dropdown подменяет onClick кнопки — клик гасим на обёртке, чтобы не открывалась строка
        <span onClick={(e) => e.stopPropagation()}>
          <Dropdown trigger={['click']} placement="bottomRight" menu={rowMenu(u)}>
            <Button type="text" aria-label={`Действия: ${userDisplayName(u)}`}>
              ⋯
            </Button>
          </Dropdown>
        </span>
      ),
    },
  ];

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        title="Не удалось загрузить пользователей"
        description={getErrorMessage(error)}
      />
    );
  }

  return (
    <Table<AdminUser>
      className={s.table}
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data?.items}
      loading={isLoading || isFetching || setStatus.isPending || remove.isPending}
      locale={{ emptyText: 'Пользователей не найдено' }}
      onRow={(u) => ({ onClick: () => edit(u) })}
      scroll={{ x: 640 }}
      pagination={{
        current: params.page,
        pageSize: PER_PAGE,
        total: data?.itemsTotal,
        showSizeChanger: false,
        hideOnSinglePage: true,
        showTotal: (total) => `Всего: ${total}`,
        onChange: onPageChange,
      }}
    />
  );
}

import { Button, Form, Input, Modal, Select, Space } from 'antd';
import NiceModal, { antdModalV5, useModal } from '@ebay/nice-modal-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  USER_ROLES,
  USER_STATUS_HINT,
  USER_STATUS_LABEL,
  USER_STATUSES,
  userRoleOptions,
} from '@shared/constants/user';
import { usersApi, usersKeys, type AdminUser } from '@shared/api/users';
import { FormField } from '@shared/components/FormField';
import s from './UserModal.module.less';

const createSchema = (isEdit: boolean) =>
  z.object({
    first_name: z.string().trim().min(1, 'Укажите имя').max(60),
    last_name: z.string().trim().min(1, 'Укажите фамилию').max(60),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Укажите email')
      .pipe(z.email('Некорректный email')),
    role: z.enum(USER_ROLES),
    status: z.enum(USER_STATUSES),
    // при изменении пустой пароль = не менять
    password: z
      .string()
      .refine((v) => (isEdit && v === '') || v.length >= 8, 'Не короче 8 символов'),
  });

type Values = z.infer<ReturnType<typeof createSchema>>;

const statusOptions = USER_STATUSES.map((st) => ({
  value: st,
  label: (
    <span className={s.statusOption}>
      {USER_STATUS_LABEL[st]}
      <small>{USER_STATUS_HINT[st]}</small>
    </span>
  ),
}));

/** Случайный пароль из 12 символов без похожих (0/O, 1/l) */
function generatePassword(length = 12) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

interface Props {
  /** передан — редактирование */
  user?: AdminUser;
  /** редактируется собственная учётная запись — роль и статус менять нельзя */
  isSelf?: boolean;
}

/** Создание / изменение пользователя (только для администратора) */
export const UserModal = NiceModal.create(({ user, isSelf }: Props) => {
  const modal = useModal();
  const queryClient = useQueryClient();
  const isEdit = !!user;

  const { control, handleSubmit, setValue } = useForm<Values>({
    resolver: zodResolver(createSchema(isEdit)),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'mop',
      status: user?.status ?? 'active',
      password: '',
    },
  });

  const save = useMutation({
    mutationFn: (v: Values) => {
      const payload = { ...v, password: v.password || null };
      return user ? usersApi.update(user.id, payload) : usersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      // имена и роли показываются в выборе МОП/МОС и в меню
      queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
      if (isSelf) queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });

  const onSubmit = handleSubmit(async (v) => {
    const saved = await save.mutateAsync(v).catch(() => null); // ошибку покажет общий тост
    if (!saved) return;
    modal.resolve(saved);
    modal.hide();
  });

  const close = () => {
    modal.resolve(undefined);
    modal.hide();
  };

  return (
    <Modal
      {...antdModalV5(modal)}
      title={isEdit ? 'Пользователь' : 'Новый пользователь'}
      width={520}
      okText={isEdit ? 'Сохранить' : 'Создать'}
      cancelText="Отмена"
      onOk={onSubmit}
      onCancel={close}
      okButtonProps={{ loading: save.isPending }}
      mask={{ closable: false }}
    >
      <Form layout="vertical" component={false}>
        <div className={s.grid}>
          <FormField control={control} name="first_name" label="Имя" required>
            {(field) => <Input {...field} autoFocus autoComplete="off" />}
          </FormField>
          <FormField control={control} name="last_name" label="Фамилия" required>
            {(field) => <Input {...field} autoComplete="off" />}
          </FormField>
        </div>

        <FormField control={control} name="email" label="Email (логин)" required>
          {(field) => <Input {...field} type="email" autoComplete="off" />}
        </FormField>

        <div className={s.grid}>
          <FormField
            control={control}
            name="role"
            label="Роль"
            required
            hint={isSelf ? 'Свою роль изменить нельзя' : undefined}
          >
            {(field) => (
              <Select
                id={field.id}
                options={userRoleOptions}
                value={field.value}
                onChange={field.onChange}
                disabled={isSelf}
              />
            )}
          </FormField>
          <FormField
            control={control}
            name="status"
            label="Статус"
            required
            hint={isSelf ? 'Свой доступ ограничить нельзя' : undefined}
          >
            {(field) => (
              <Select
                id={field.id}
                options={statusOptions}
                labelRender={({ value }) => USER_STATUS_LABEL[value as Values['status']]}
                value={field.value}
                onChange={field.onChange}
                disabled={isSelf}
              />
            )}
          </FormField>
        </div>

        <FormField
          control={control}
          name="password"
          label={isEdit ? 'Новый пароль' : 'Пароль'}
          required={!isEdit}
          hint={isEdit ? 'Оставьте пустым, чтобы не менять' : 'Не короче 8 символов'}
        >
          {(field) => (
            <Space.Compact className={s.full}>
              <Input.Password {...field} autoComplete="new-password" />
              <Button
                onClick={() =>
                  setValue('password', generatePassword(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                Сгенерировать
              </Button>
            </Space.Compact>
          )}
        </FormField>
      </Form>
    </Modal>
  );
});

import { Select } from 'antd';
import { useUsers } from '@shared/api/user';
import type { UserRole } from '@shared/constants/user';

interface Props {
  id?: string;
  role: UserRole;
  value: number | null;
  onChange: (value: number | null) => void;
  /** имя для значения, которого нет в списке (например, сотрудник сменил роль) */
  fallbackLabel?: string;
}

/** Выбор сотрудника по роли (МОП / МОС) */
export function UserSelect({ id, role, value, onChange, fallbackLabel }: Props) {
  const users = useUsers(role);
  const options = users.data?.map((u) => ({ value: u.id, label: u.name || u.email })) ?? [];
  if (value !== null && fallbackLabel && !options.some((o) => o.value === value)) {
    options.unshift({ value, label: fallbackLabel });
  }

  return (
    <Select<number>
      id={id}
      allowClear
      placeholder="Не назначен"
      loading={users.isLoading}
      options={options}
      showSearch={{ optionFilterProp: 'label' }}
      notFoundContent={users.isError ? 'Не удалось загрузить' : undefined}
      value={value}
      onChange={(v) => onChange(v ?? null)}
    />
  );
}

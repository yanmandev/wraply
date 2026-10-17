import { Alert, Table, type TableColumnsType } from 'antd';
import { useNavigate } from 'react-router';
import { useDeals, type DealListParams } from '@shared/api/deal';
import { getErrorMessage } from '@shared/api/http';
import { formatDate } from '@shared/lib/date';
import type { DealListItem } from '@shared/types/deal';
import { DealStatusTag } from '../../shared/components/DealStatusTag';
import s from './DealsTable.module.less';

const PER_PAGE = 25;

const columns: TableColumnsType<DealListItem> = [
  {
    key: 'number',
    title: '№',
    dataIndex: 'number',
    width: 110,
    render: (v: string) => <span className={s.number}>{v}</span>,
  },
  { key: 'name', title: 'Сделка', dataIndex: 'name', ellipsis: true },
  {
    key: 'client',
    title: 'Клиент',
    ellipsis: true,
    render: (_, d) => d.client_name || d.client_full_name || <span className={s.muted}>—</span>,
  },
  {
    key: 'status',
    title: 'Стадия',
    dataIndex: 'status',
    width: 230,
    render: (v: DealListItem['status']) => <DealStatusTag status={v} />,
  },
  {
    key: 'mop',
    title: 'Менеджер',
    dataIndex: 'mop_name',
    width: 190,
    ellipsis: true,
    render: (v: string | null) => v || <span className={s.muted}>—</span>,
  },
  {
    key: 'created',
    title: 'Создана',
    dataIndex: 'created_at',
    width: 110,
    render: (v: number) => formatDate(v),
  },
  {
    key: 'updated',
    title: 'Обновлена',
    dataIndex: 'updated_at',
    width: 110,
    render: (v: number | null) => formatDate(v),
  },
];

interface Props {
  params: DealListParams;
  onPageChange: (page: number) => void;
}

export function DealsTable({ params, onPageChange }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, error } = useDeals({
    ...params,
    per_page: PER_PAGE,
  });

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        title="Не удалось загрузить сделки"
        description={getErrorMessage(error)}
      />
    );
  }

  return (
    <Table<DealListItem>
      className={s.table}
      rowKey="id"
      size="middle"
      columns={columns}
      dataSource={data?.items}
      loading={isLoading || isFetching}
      scroll={{ x: 900 }}
      locale={{ emptyText: 'Сделок не найдено' }}
      onRow={(d) => ({
        onClick: () => navigate(`/deals/${encodeURIComponent(d.number)}`),
      })}
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

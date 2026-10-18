import { Alert, Button, Table, Tag, Tooltip, type TableColumnsType } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DOC_EXCHANGE_LABEL,
  DOC_STATUS_COLOR,
  DOC_STATUS_LABEL,
  DOC_TYPE_LABEL,
  DOC_TYPES_WITH_AMOUNT,
  DOC_TYPES_WITH_PAYMENT,
  PAYMENT_TERMS_LABEL,
} from '@shared/constants/document';
import { documentApi, documentKeys, useDealDocuments } from '@shared/api/document';
import { getErrorMessage } from '@shared/api/http';
import { counterpartyName } from '@shared/api/counterparty';
import { ConfirmModal } from '@shared/components/ConfirmModal';
import { Money } from '@shared/components/Money';
import { formatDate } from '@shared/lib/date';
import type { DealCard } from '@shared/types/deal';
import type { DealDocument } from '@shared/types/document';
import { DocumentModal } from './DocumentModal';
import cardStyles from '../../Deal.module.less';
import s from './DocumentsCard.module.less';

const dash = <span className={s.muted}>—</span>;

/** Документы по сделке: счета, акты, договоры. Сохраняются сразу, отдельно от формы сделки */
export function DocumentsCard({ deal }: { deal: DealCard }) {
  const queryClient = useQueryClient();
  const { data: docs = [], isLoading, isError, error } = useDealDocuments(deal.number);

  const counterparties = deal.counterparties.map((c) => ({
    id: c.id,
    name: counterpartyName(c),
    is_primary: c.is_primary,
  }));

  // Сводка как в прототипе: выставлено = все счета, оплачено = счета в статусе «Оплачен»
  const invoices = docs.filter((d) => d.type === 'invoice');
  const issued = invoices.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const paid = invoices
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const openModal = (props: { document?: DealDocument }) =>
    NiceModal.show(DocumentModal, { dealNumber: deal.number, counterparties, ...props });

  const remove = useMutation({
    mutationFn: (doc: DealDocument) => documentApi.remove(deal.number, doc.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list(deal.number) });
      toast.success('Документ удалён');
    },
  });

  const confirmRemove = async (doc: DealDocument) => {
    const ok = await NiceModal.show(ConfirmModal, {
      title: `Удалить «${doc.title}»?`,
      content: doc.file_url ? 'Сам файл по ссылке останется там, где лежит.' : undefined,
      okText: 'Удалить',
      danger: true,
    });
    if (ok) remove.mutate(doc);
  };

  const columns: TableColumnsType<DealDocument> = [
    {
      key: 'n',
      title: '№',
      width: 48,
      render: (_, __, i) => <span className={s.muted}>{i + 1}</span>,
    },
    {
      key: 'title',
      title: 'Документ',
      width: 260,
      render: (_, d) => (
        <button type="button" className={s.title} onClick={() => openModal({ document: d })}>
          {d.title}
        </button>
      ),
    },
    { key: 'type', title: 'Тип', width: 120, render: (_, d) => DOC_TYPE_LABEL[d.type] },
    {
      key: 'amount',
      title: 'Сумма',
      width: 130,
      align: 'right',
      render: (_, d) =>
        DOC_TYPES_WITH_AMOUNT.includes(d.type) && d.amount !== null ? (
          <b className={s.sum}>
            <Money value={d.amount} />
          </b>
        ) : (
          dash
        ),
    },
    {
      key: 'pay_date',
      title: 'Дата оплаты',
      width: 110,
      render: (_, d) =>
        DOC_TYPES_WITH_PAYMENT.includes(d.type) && d.pay_date ? formatDate(d.pay_date) : dash,
    },
    {
      key: 'status',
      title: 'Статус',
      width: 190,
      render: (_, d) => <Tag color={DOC_STATUS_COLOR[d.status]}>{DOC_STATUS_LABEL[d.status]}</Tag>,
    },
    {
      key: 'terms',
      title: 'Способ оплаты',
      width: 160,
      render: (_, d) =>
        DOC_TYPES_WITH_PAYMENT.includes(d.type) && d.payment_terms
          ? PAYMENT_TERMS_LABEL[d.payment_terms]
          : dash,
    },
    {
      key: 'exchange',
      title: 'Обмен',
      width: 80,
      render: (_, d) => DOC_EXCHANGE_LABEL[d.exchange],
    },
    {
      key: 'entity',
      title: 'Наши реквизиты',
      width: 150,
      render: (_, d) => d.our_entity_name ?? dash,
    },
    {
      key: 'comment',
      title: 'Комментарий',
      width: 180,
      ellipsis: true,
      render: (_, d) => (d.comment ? <span className={s.comment}>{d.comment}</span> : dash),
    },
    {
      key: 'file',
      title: 'Файл',
      width: 56,
      align: 'center',
      render: (_, d) =>
        d.file_url ? (
          <Tooltip title={`Открыть: ${d.file_name || d.file_url}`}>
            <a
              className={s.fileLink}
              href={d.file_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Открыть файл ${d.file_name || d.title}`}
            >
              ↓
            </a>
          </Tooltip>
        ) : (
          dash
        ),
    },
    {
      key: 'actions',
      width: 76,
      render: (_, d) => (
        <span className={s.actions}>
          <Tooltip title="Изменить">
            <Button
              type="text"
              size="small"
              aria-label={`Изменить ${d.title}`}
              onClick={() => openModal({ document: d })}
            >
              ✎
            </Button>
          </Tooltip>
          <Tooltip title="Удалить">
            <Button
              type="text"
              size="small"
              danger
              aria-label={`Удалить ${d.title}`}
              onClick={() => confirmRemove(d)}
            >
              ✕
            </Button>
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <section className={cardStyles.card}>
      <div className={cardStyles.cardHead}>
        <h2>Документы по сделке</h2>
        {invoices.length > 0 && (
          <span className={cardStyles.sub}>
            Выставлено <Money value={issued} /> · оплачено <Money value={paid} />
          </span>
        )}
      </div>

      {isError ? (
        <div className={cardStyles.cardBody}>
          <Alert
            type="error"
            showIcon
            title="Не удалось загрузить документы"
            description={getErrorMessage(error)}
          />
        </div>
      ) : (
        <Table<DealDocument>
          className={s.table}
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={docs}
          loading={isLoading || remove.isPending}
          pagination={false}
          scroll={{ x: 1560 }}
          locale={{ emptyText: 'Документов пока нет' }}
        />
      )}

      <footer className={s.foot}>
        <Button type="dashed" onClick={() => openModal({})}>
          + Добавить документ
        </Button>
        <span className={s.hint}>
          файл — ссылкой на Яндекс.Диск, Google Drive и т.п.; заполните тип, сумму, дату и статус
        </span>
      </footer>
    </section>
  );
}

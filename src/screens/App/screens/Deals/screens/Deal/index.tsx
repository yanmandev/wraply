import { Alert, Descriptions, Empty, Skeleton } from 'antd';
import { Link, useParams } from 'react-router';
import { HTTPError } from 'ky';
import { useDeal } from '@shared/api/deal';
import { counterpartyName } from '@shared/api/counterparty';
import { getErrorMessage } from '@shared/api/http';
import { CLIENT_TYPE_LABEL } from '@shared/constants/deal';
import { formatDate } from '@shared/lib/date';
import { formatPhone } from '@shared/lib/phone';
import { PageBody, PageHeader, PageTitle } from '@app/shared/components/Page';
import { DealStatusTag } from '../../shared/components/DealStatusTag';
import s from './Deal.module.less';

/** Карточка сделки. Пока — сводка, чтобы проверить результат создания */
export default function Deal() {
  const { number = '' } = useParams();
  const { data: deal, isLoading, error } = useDeal(number);

  return (
    <>
      <PageHeader>
        <Link to="/deals" className={s.back}>
          ← Сделки
        </Link>
        <PageTitle>
          {number}
          {deal && <span className={s.name}> · {deal.name}</span>}
        </PageTitle>
        {deal && <DealStatusTag status={deal.status} />}
      </PageHeader>

      <PageBody>
        {isLoading ? (
          <Skeleton active />
        ) : error ? (
          error instanceof HTTPError && error.response.status === 404 ? (
            <Empty description={`Сделка ${number} не найдена`} />
          ) : (
            <Alert
              type="error"
              showIcon
              title="Не удалось загрузить сделку"
              description={getErrorMessage(error)}
            />
          )
        ) : deal ? (
          <section className={s.card}>
            <Descriptions
              column={{ xs: 1, md: 2 }}
              items={[
                {
                  label: 'Тип клиента',
                  children: deal.client_type ? CLIENT_TYPE_LABEL[deal.client_type] : '—',
                },
                { label: 'Создана', children: formatDate(deal.created_at, 'DD.MM.YYYY HH:mm') },
                { label: 'МОП', children: deal.mop?.name || '—' },
                { label: 'МОС', children: deal.mos?.name || '—' },
                {
                  label: 'Контрагенты',
                  span: 2,
                  children: deal.counterparties.length
                    ? deal.counterparties
                        .map((c) => counterpartyName(c) + (c.is_primary ? ' (основной)' : ''))
                        .join(', ')
                    : '—',
                },
                {
                  label: 'Контакты',
                  span: 2,
                  children: deal.contacts.length
                    ? deal.contacts
                        .map((c) =>
                          [c.name, formatPhone(c.phone), c.is_primary ? '(основной)' : '']
                            .filter(Boolean)
                            .join(' '),
                        )
                        .join(', ')
                    : '—',
                },
              ]}
            />
            <Empty className={s.todo} description="Полная карточка сделки — в разработке" />
          </section>
        ) : null}
      </PageBody>
    </>
  );
}

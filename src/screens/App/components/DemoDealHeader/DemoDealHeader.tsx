import { useState } from 'react';
import { Button, Dropdown } from 'antd';
import { toast } from 'sonner';
import { Money } from '@shared/components/Money';
import { Header, type HeaderStat, type HeaderTab } from '../Header';

// Временные данные: шапка как на странице сделки в прототипе.
// Когда появятся экраны, каждый будет передавать в Header свои данные.
const DEAL = {
  id: '57299АА',
  name: 'Тестовая сделка Заказ SV',
  positions: 3,
  qty: 10,
  area: 0,
  cost: 0,
};

const stats: HeaderStat[] = [
  {
    key: 'pos',
    prefix: true,
    label: 'Позиции',
    value: DEAL.positions,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M5.5 8.2l2 2 3.5-4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: 'qty',
    label: 'шт',
    value: DEAL.qty,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 4h10M3 8h10M3 12h6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: 'area',
    label: 'м²',
    value: DEAL.area,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect
          x="2.5"
          y="2.5"
          width="11"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M2.5 6.5h11M6.5 2.5v11" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    key: 'cost',
    value: <Money value={DEAL.cost} decimalScale={0} />,
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M6.2 11V5h2.2a1.8 1.8 0 1 1 0 3.6H6.2M6.2 10h3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const tabs: HeaderTab[] = [
  { key: 'main', label: 'Главная' },
  { key: 'smeta', label: 'Смета/Заказ', group: 'Смета или КП' },
  { key: 'kp', label: 'КП', group: 'Смета или КП' },
  { key: 'zamer', label: 'Замер' },
  { key: 'design', label: 'Дизайн' },
  { key: 'cp', label: 'ЦП' },
  { key: 'prod', label: 'Производство' },
  { key: 'rek', label: 'Рекламации' },
];

export function DemoDealHeader() {
  const [tab, setTab] = useState('main');

  return (
    <Header
      title={`${DEAL.id} · ${DEAL.name}`}
      stats={stats}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      note={{ text: '✓ Изменений нет', ok: true }}
      actions={
        <>
          <Button onClick={() => toast.info('Предпросмотр — в разработке')}>👁 Предпросмотр</Button>
          <Button>Открыть в новом окне</Button>
          <Button type="primary" disabled>
            Сохранить
          </Button>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: [
                { key: 'copy', label: 'Копировать сделку' },
                { key: 'history', label: 'История изменений' },
                { type: 'divider' },
                { key: 'delete', label: 'Удалить сделку', danger: true },
              ],
              onClick: ({ key }) => toast(`Действие «${key}» — в разработке`),
            }}
          >
            <Button aria-label="Ещё действия">⋯</Button>
          </Dropdown>
        </>
      }
    />
  );
}

import { Button, Dropdown, Grid } from 'antd';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Header, type HeaderStat, type HeaderTab } from '@app/components/Header';
import { Money } from '@shared/components/Money';
import { DealTitle } from './DealTitle';

// Показатели появятся вместе с позициями сметы — пока нули
const stats: HeaderStat[] = [
  {
    key: 'pos',
    prefix: true,
    label: 'Позиции',
    value: 0,
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
    value: 0,
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
    value: 0,
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
    value: <Money value={0} decimalScale={0} />,
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

// Пока готова только «Главная», остальные разделы видны, но недоступны
const tabs: HeaderTab[] = [
  { key: 'main', label: 'Главная' },
  { key: 'smeta', label: 'Смета/Заказ', group: 'Смета или КП', disabled: true },
  { key: 'kp', label: 'КП', group: 'Смета или КП', disabled: true },
  { key: 'zamer', label: 'Замер', disabled: true },
  { key: 'design', label: 'Дизайн', disabled: true },
  { key: 'cp', label: 'ЦП', disabled: true },
  { key: 'prod', label: 'Производство', disabled: true },
  { key: 'rek', label: 'Рекламации', disabled: true },
];

interface Props {
  number: string;
  /** null — данные ещё грузятся, название не показываем */
  ready: boolean;
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

/** Шапка сделки (по прототипу .deal-header) */
export function DealHeader({ number, ready, isDirty, saving, onSave, onDiscard }: Props) {
  const navigate = useNavigate();
  // На узком экране второстепенные кнопки уходят в меню «⋯», чтобы шапка не разъезжалась
  const compact = !Grid.useBreakpoint().md;

  const preview = () => toast.info('Предпросмотр задач — в разработке');
  const openInNewWindow = () => window.open(window.location.href, '_blank', 'noopener');

  return (
    <Header
      title={ready ? <DealTitle number={number} /> : number}
      stats={stats}
      tabs={tabs}
      activeTab="main"
      note={
        isDirty ? { text: '⚠ Есть несохранённые изменения' } : { text: '✓ Изменений нет', ok: true }
      }
      actions={
        <>
          {!compact && (
            <>
              <Button onClick={preview}>👁 Предпросмотр</Button>
              <Button onClick={openInNewWindow}>Открыть в новом окне</Button>
            </>
          )}
          <Button
            type="primary"
            disabled={!isDirty}
            loading={saving}
            onClick={onSave}
            title="Ctrl+S"
          >
            Сохранить
          </Button>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
              items: [
                ...(compact
                  ? [
                      { key: 'preview', label: '👁 Предпросмотр' },
                      { key: 'window', label: 'Открыть в новом окне' },
                      { type: 'divider' as const },
                    ]
                  : []),
                { key: 'discard', label: 'Отменить изменения', disabled: !isDirty },
                { key: 'link', label: 'Скопировать ссылку' },
                { type: 'divider' },
                { key: 'new', label: 'Новая сделка' },
              ],
              onClick: ({ key }) => {
                if (key === 'preview') preview();
                if (key === 'window') openInNewWindow();
                if (key === 'discard') onDiscard();
                if (key === 'link') {
                  navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => toast.success('Ссылка скопирована'))
                    .catch(() => toast.error('Не удалось скопировать ссылку'));
                }
                if (key === 'new') navigate('/deals/new');
              },
            }}
          >
            <Button aria-label="Ещё действия">⋯</Button>
          </Dropdown>
        </>
      }
    />
  );
}

import { toOptions, type LabelMap } from './options';

/* ═══ Статус сделки (этапы воронки) ═══ */

export const DEAL_STATUSES = [
  'need_identified',
  'tz_formed',
  'zm_dm_cp',
  'pre_calc',
  'zm_dm_cp_push',
  'kp_sent',
  'push_started',
  'contract_sent',
  'handed_to_mos',
  'closing_docs',
  'completed',
] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export const DEAL_STATUS_LABEL: LabelMap<DealStatus> = {
  need_identified: 'Потребность выявлена',
  tz_formed: 'ТЗ сформировано',
  zm_dm_cp: 'ЗМ/ДМ/ЦП',
  pre_calc: 'Предварительный расчёт',
  zm_dm_cp_push: 'ЗМ/ДМ/ЦП Дожим',
  kp_sent: 'КП отправлено',
  push_started: 'Дожим запущен',
  contract_sent: 'Договор/Счёт направлен',
  handed_to_mos: 'Передано МОСУ',
  closing_docs: 'Закрывающие документы',
  completed: 'Сделка завершена',
};

/** Цвета этапов из реестра сделок прототипа (D_STAGE_CLR) */
export const DEAL_STATUS_COLOR: LabelMap<DealStatus> = {
  need_identified: '#111827',
  tz_formed: '#F0A63C',
  zm_dm_cp: '#29B6F6',
  pre_calc: '#F9D64F',
  zm_dm_cp_push: '#7C3AED',
  kp_sent: '#F65CA8',
  push_started: '#37C8F0',
  contract_sent: '#23C08B',
  handed_to_mos: '#F0C93C',
  closing_docs: '#3E63DD',
  completed: '#8A94A6',
};

export const DEAL_STATUS_INITIAL: DealStatus = 'need_identified';
export const dealStatusOptions = toOptions(DEAL_STATUS_LABEL);

/* ═══ Тип клиента ═══ */

export const CLIENT_TYPES = ['organization', 'ip', 'individual', 'government'] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const CLIENT_TYPE_LABEL: LabelMap<ClientType> = {
  organization: 'Юрлицо',
  ip: 'ИП',
  individual: 'Физлицо',
  government: 'Госзаказ',
};
export const clientTypeOptions = toOptions(CLIENT_TYPE_LABEL);

/* ═══ Квалификация (deal_qualification) ═══ */

export const INSTALL_PLACES = ['our_site', 'client_site', 'discussing'] as const;
export type InstallPlace = (typeof INSTALL_PLACES)[number];
export const INSTALL_PLACE_LABEL: LabelMap<InstallPlace> = {
  our_site: 'У нас',
  client_site: 'Выезд к клиенту',
  discussing: 'Обсуждается',
};

export const OLD_FILM_OPTIONS = ['yes', 'no', 'partial'] as const;
export type OldFilm = (typeof OLD_FILM_OPTIONS)[number];
export const OLD_FILM_LABEL: LabelMap<OldFilm> = {
  yes: 'Да',
  no: 'Нет',
  partial: 'Частично',
};

export const MEASUREMENT_OPTIONS = ['yes', 'no', 'need_ours'] as const;
export type Measurement = (typeof MEASUREMENT_OPTIONS)[number];
export const MEASUREMENT_LABEL: LabelMap<Measurement> = {
  yes: 'Да',
  no: 'Нет',
  need_ours: 'Нужен наш замер',
};

export const PRIORITY_OPTIONS = ['max_lifetime', 'budget', 'discussing'] as const;
export type Priority = (typeof PRIORITY_OPTIONS)[number];
export const PRIORITY_LABEL: LabelMap<Priority> = {
  max_lifetime: 'Максимальный срок',
  budget: 'Бюджетный',
  discussing: 'Обсуждается',
};

export const DESIGN_SOURCES = ['ready', 'by_client', 'by_us'] as const;
export type DesignSource = (typeof DESIGN_SOURCES)[number];
export const DESIGN_SOURCE_LABEL: LabelMap<DesignSource> = {
  ready: 'Есть готовый',
  by_client: 'Разрабатывает сам',
  by_us: 'Делает у нас',
};

/** Вопросы квалификации в порядке прототипа. client_type хранится в deal */
export const QUALIFICATION_FIELDS = [
  {
    key: 'client_type',
    label: 'Тип клиента',
    kind: 'select',
    options: toOptions(CLIENT_TYPE_LABEL),
  },
  {
    key: 'vehicle_count',
    label: 'Сколько авто надо забрендировать?',
    kind: 'number',
    placeholder: 'шт.',
  },
  {
    key: 'operating_conditions',
    label: 'Где и в каких условиях эксплуатируется авто?',
    kind: 'text',
    placeholder: 'город/трасса, климат, мойки…',
  },
  {
    key: 'install_place',
    label: 'Монтаж у нас или выезд к клиенту?',
    kind: 'select',
    options: toOptions(INSTALL_PLACE_LABEL),
  },
  {
    key: 'old_film',
    label: 'Есть плёнка, которую надо снять?',
    kind: 'select',
    options: toOptions(OLD_FILM_LABEL),
  },
  {
    key: 'measurement',
    label: 'Есть ли замер ТС?',
    kind: 'select',
    options: toOptions(MEASUREMENT_LABEL),
  },
  {
    key: 'vehicles',
    label: 'Тип/модель и кол-во ТС?',
    kind: 'text',
    placeholder: 'если одно — уточнить «всего одно?»',
  },
  {
    key: 'goal',
    label: 'Основная цель брендирования?',
    kind: 'text',
    placeholder: 'реклама, стиль, защита ЛКП…',
  },
  {
    key: 'deadline',
    label: 'Сроки оклейки?',
    kind: 'text',
    placeholder: 'срок проекта до 60 дней',
  },
  {
    key: 'priority',
    label: 'Максимальный срок службы или бюджет?',
    kind: 'select',
    options: toOptions(PRIORITY_LABEL),
  },
  {
    key: 'design',
    label: 'Дизайн: есть / сам / у нас?',
    kind: 'select',
    options: toOptions(DESIGN_SOURCE_LABEL),
  },
  {
    key: 'invoice_requirements',
    label: 'Требования к счёту?',
    kind: 'text',
    placeholder: 'НДС, реквизиты…',
  },
] as const;

import { toOptions, type LabelMap } from './options';

/* ═══ Тип документа ═══ */

export const DOC_TYPES = [
  'invoice',
  'act_upd',
  'contract',
  'specification',
  'invoice_factura',
  'other',
] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const DOC_TYPE_LABEL: LabelMap<DocType> = {
  invoice: 'Счёт',
  act_upd: 'Акт/УПД',
  contract: 'Договор',
  specification: 'Спецификация',
  invoice_factura: 'Счёт-фактура',
  other: 'Прочее',
};
export const docTypeOptions = toOptions(DOC_TYPE_LABEL);

/** У каких типов есть сумма (как SUM_TYPES в прототипе) */
export const DOC_TYPES_WITH_AMOUNT: readonly DocType[] = ['invoice', 'act_upd'];
/** Дата и условия оплаты — только у счёта (PAY_DATE_TYPES в прототипе) */
export const DOC_TYPES_WITH_PAYMENT: readonly DocType[] = ['invoice'];

/* ═══ Статус ═══ */

export const DOC_STATUSES = ['draft', 'issued', 'paid', 'signing', 'signed', 'uploaded'] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];

export const DOC_STATUS_LABEL: LabelMap<DocStatus> = {
  draft: 'Черновик',
  issued: 'Выставлен, не оплачен',
  paid: 'Оплачен',
  signing: 'На подписании (ЭДО)',
  signed: 'Подписан',
  uploaded: 'Загружен',
};

/** Цвет тега antd — как pill-ok / pill-warn / pill-info / pill-muted в прототипе */
export const DOC_STATUS_COLOR: LabelMap<DocStatus> = {
  draft: 'default',
  issued: 'warning',
  paid: 'success',
  signing: 'processing',
  signed: 'success',
  uploaded: 'default',
};

/**
 * Какие статусы осмысленны для типа — подсказка для выпадающего списка.
 * В прототипе доступны все; сервер тоже не ограничивает.
 */
export const DOC_STATUSES_BY_TYPE: Record<DocType, readonly DocStatus[]> = {
  invoice: ['draft', 'issued', 'paid', 'uploaded'],
  act_upd: ['draft', 'signing', 'signed', 'uploaded'],
  contract: ['draft', 'signing', 'signed', 'uploaded'],
  specification: ['draft', 'signing', 'signed', 'uploaded'],
  invoice_factura: ['draft', 'signing', 'signed', 'uploaded'],
  other: ['draft', 'uploaded'],
};

/* ═══ Условия оплаты (только счёт) ═══ */

export const PAYMENT_TERMS = ['prepay_100', 'postpay_30', 'postpay_60', 'postpay_90'] as const;
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];

export const PAYMENT_TERMS_LABEL: LabelMap<PaymentTerms> = {
  prepay_100: 'Предоплата 100%',
  postpay_30: 'Постоплата 30 дней',
  postpay_60: 'Постоплата 60 дней',
  postpay_90: 'Постоплата 90 дней',
};
export const paymentTermsOptions = toOptions(PAYMENT_TERMS_LABEL);

/* ═══ Обмен документами ═══ */

export const DOC_EXCHANGES = ['edo', 'paper'] as const;
export type DocExchange = (typeof DOC_EXCHANGES)[number];

export const DOC_EXCHANGE_LABEL: LabelMap<DocExchange> = {
  edo: 'ЭДО',
  paper: 'Бумага',
};
export const docExchangeOptions = toOptions(DOC_EXCHANGE_LABEL);

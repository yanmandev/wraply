import type { DocExchange, DocStatus, DocType, PaymentTerms } from '@shared/constants/document';

/** Xano: timestamp — мс, date — строка YYYY-MM-DD */
type Timestamp = number;
type DateString = string;

/** Наше юрлицо — «Наши реквизиты» в документах (GET /our_entity) */
export interface OurEntity {
  id: number;
  short_name: string;
  full_name: string | null;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  address: string | null;
  bank_name: string | null;
  bik: string | null;
  account: string | null;
  corr_account: string | null;
  /** % НДС; null — без НДС */
  vat_rate: number | null;
  is_active: boolean;
  sort: number;
  created_at: Timestamp;
}

/** Документ сделки (GET /deal/{number}/document) */
export interface DealDocument {
  id: number;
  deal_id: number;
  type: DocType;
  title: string;
  number: string | null;
  doc_date: DateString | null;
  /** только у invoice / act_upd */
  amount: number | null;
  /** только у invoice */
  pay_date: DateString | null;
  payment_terms: PaymentTerms | null;
  status: DocStatus;
  exchange: DocExchange;
  our_entity_id: number | null;
  our_entity_name: string | null;
  our_entity_vat_rate: number | null;
  counterparty_id: number | null;
  comment: string | null;
  /** ссылка на файл (Яндекс.Диск, Google Drive…) и его название */
  file_url: string | null;
  file_name: string | null;
  created_by: number | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

/** Поля формы документа (JSON) */
export interface DealDocumentPayload {
  type: DocType;
  title: string;
  doc_number: string | null;
  doc_date: DateString | null;
  amount: number | null;
  pay_date: DateString | null;
  payment_terms: PaymentTerms | null;
  status: DocStatus;
  exchange: DocExchange;
  our_entity_id: number | null;
  counterparty_id: number | null;
  comment: string | null;
  file_url: string | null;
  file_name: string | null;
}

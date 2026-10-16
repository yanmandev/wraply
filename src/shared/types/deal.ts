import type {
  ClientType,
  DealStatus,
  DesignSource,
  InstallPlace,
  Measurement,
  OldFilm,
  Priority,
} from '@shared/constants/deal';
import type { CounterpartyType } from '@shared/constants/counterparty';

/** Xano хранит timestamp в миллисекундах, date — строкой YYYY-MM-DD */
type Timestamp = number;
type DateString = string;

export interface Deal {
  id: number;
  /** «Красивый» номер, например 10001KB — используется в URL /deals/:number */
  number: string;
  name: string;
  status: DealStatus;
  client_type: ClientType | null;
  mop_id: number | null;
  mos_id: number | null;
  created_by: number | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface DealQualification {
  id: number;
  deal_id: number;
  vehicle_count: number | null;
  operating_conditions: string | null;
  install_place: InstallPlace | null;
  old_film: OldFilm | null;
  measurement: Measurement | null;
  vehicles: string | null;
  goal: string | null;
  deadline: string | null;
  priority: Priority | null;
  design: DesignSource | null;
  invoice_requirements: string | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface Counterparty {
  id: number;
  type: CounterpartyType;
  inn: string | null;
  kpp: string | null;
  ogrn: string | null;
  short_name: string | null;
  full_name: string;
  registered_at: DateString | null;
  okpo: string | null;
  oktmo: string | null;
  director: string | null;
  accountant: string | null;
  address: string | null;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface DealCounterparty {
  id: number;
  deal_id: number;
  counterparty_id: number;
  is_primary: boolean;
  created_at: Timestamp;
}

/** Связь сделки с контактом контрагента (многие ко многим) */
export interface DealContact {
  id: number;
  deal_id: number;
  contact_id: number;
  is_primary: boolean;
  created_at: Timestamp;
}

export interface CounterpartyContact {
  id: number;
  counterparty_id: number;
  name: string;
  phone: string | null;
  note: string | null;
  created_at: Timestamp;
}

/* ═══ Ответы API ═══ */

export interface UserBrief {
  id: number;
  name: string;
  email: string;
  role?: string;
}

/** Строка реестра сделок (GET /deal) */
export interface DealListItem extends Deal {
  mop_name: string | null;
  client_name: string | null;
  client_full_name: string | null;
}

/** Карточка сделки (GET /deal/{number}) */
export interface DealCard extends Deal {
  qualification: DealQualification | null;
  counterparties: (Counterparty & { is_primary: boolean })[];
  contacts: (CounterpartyContact & { is_primary: boolean })[];
  mop: UserBrief | null;
  mos: UserBrief | null;
}

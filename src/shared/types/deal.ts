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
  /** «Красивый» номер, например 57299АА — используется в URL /deals/:number */
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
  operating_conditions: string;
  install_place: InstallPlace | null;
  old_film: OldFilm | null;
  measurement: Measurement | null;
  vehicles: string;
  goal: string;
  deadline: string;
  priority: Priority | null;
  design: DesignSource | null;
  invoice_requirements: string;
  created_at: Timestamp;
  updated_at: Timestamp | null;
}

export interface Counterparty {
  id: number;
  type: CounterpartyType;
  inn: string;
  kpp: string;
  ogrn: string;
  short_name: string;
  full_name: string;
  registered_at: DateString | null;
  okpo: string;
  oktmo: string;
  director: string;
  accountant: string;
  address: string;
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
  phone: string;
  note: string;
  created_at: Timestamp;
}

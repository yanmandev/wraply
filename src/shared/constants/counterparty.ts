import { toOptions, type LabelMap } from './options';

export const COUNTERPARTY_TYPES = ['organization', 'ip', 'individual'] as const;
export type CounterpartyType = (typeof COUNTERPARTY_TYPES)[number];

export const COUNTERPARTY_TYPE_LABEL: LabelMap<CounterpartyType> = {
  organization: 'Организация',
  ip: 'ИП',
  individual: 'Физлицо',
};
export const counterpartyTypeOptions = toOptions(COUNTERPARTY_TYPE_LABEL);

type RequisiteField =
  | 'inn'
  | 'kpp'
  | 'ogrn'
  | 'short_name'
  | 'full_name'
  | 'registered_at'
  | 'okpo'
  | 'oktmo'
  | 'director'
  | 'accountant'
  | 'address';

/** Какие реквизиты показывать и какие обязательны для каждого типа */
export const COUNTERPARTY_FIELDS: Record<
  CounterpartyType,
  { visible: RequisiteField[]; required: RequisiteField[] }
> = {
  organization: {
    visible: [
      'inn',
      'kpp',
      'ogrn',
      'short_name',
      'full_name',
      'registered_at',
      'okpo',
      'oktmo',
      'director',
      'accountant',
      'address',
    ],
    required: ['inn', 'kpp', 'ogrn', 'full_name'],
  },
  ip: {
    visible: [
      'inn',
      'ogrn',
      'short_name',
      'full_name',
      'registered_at',
      'okpo',
      'oktmo',
      'address',
    ],
    required: ['inn', 'ogrn', 'full_name'],
  },
  individual: {
    visible: ['inn', 'full_name', 'address'],
    required: ['full_name'],
  },
};

/** Длина ИНН/ОГРН зависит от типа: у ИП — ИНН 12 цифр и ОГРНИП 15 */
export const REQUISITE_LENGTH = {
  organization: { inn: 10, kpp: 9, ogrn: 13 },
  ip: { inn: 12, ogrn: 15 },
  individual: { inn: 12 },
} as const;

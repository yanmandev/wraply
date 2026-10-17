import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ClientType, DealStatus } from '@shared/constants/deal';
import type { Paged } from '@shared/types/api';
import type { DealCard, DealListItem, DealQualification } from '@shared/types/deal';
import { api } from './http';

/** Пресеты фильтра реестра — обрабатываются в Xano (deal.list.xs, input preset) */
export type DealPreset = 'all' | 'work' | 'closed';

export interface DealListParams {
  search?: string;
  status?: DealStatus;
  mop_id?: number;
  preset?: DealPreset;
  page?: number;
  per_page?: number;
}

export type QualificationPayload = Omit<
  DealQualification,
  'id' | 'deal_id' | 'created_at' | 'updated_at'
>;

export interface CreateDealPayload {
  name: string;
  client_type: ClientType | null;
  mop_id: number | null;
  mos_id: number | null;
  counterparty_ids: number[];
  primary_counterparty_id: number | null;
  contact_ids: number[];
  primary_contact_id: number | null;
  qualification: QualificationPayload;
}

export interface UpdateDealPayload {
  name: string;
  client_type: ClientType | null;
  mop_id: number | null;
  mos_id: number | null;
  status?: DealStatus;
}

const dealPath = (number: string) => `deal/${encodeURIComponent(number)}`;

export const dealKeys = {
  all: ['deal'] as const,
  list: (params: DealListParams) => ['deal', 'list', params] as const,
  card: (number: string) => ['deal', 'card', number] as const,
};

// Пустые значения не отправляем, чтобы ==? в Xano их игнорировал
const toSearchParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>;

export const dealApi = {
  list: (params: DealListParams) =>
    api.deal.get('deal', { searchParams: toSearchParams(params) }).json<Paged<DealListItem>>(),

  get: (number: string) => api.deal.get(dealPath(number)).json<DealCard>(),

  create: (payload: CreateDealPayload) => api.deal.post('deal', { json: payload }).json<DealCard>(),

  /** Основные поля: null очищает значение; status не передан — не меняется */
  update: (number: string, payload: UpdateDealPayload) =>
    api.deal.patch(dealPath(number), { json: payload }).json<DealCard>(),

  updateQualification: (number: string, qualification: QualificationPayload) =>
    api.deal
      .patch(`${dealPath(number)}/qualification`, { json: { qualification } })
      .json<DealQualification>(),

  /* связи с контрагентами */
  linkCounterparty: (number: string, counterpartyId: number, isPrimary: boolean) =>
    api.deal
      .post(`${dealPath(number)}/counterparty`, {
        json: { counterparty_id: counterpartyId, is_primary: isPrimary },
      })
      .json<DealCard>(),
  setPrimaryCounterparty: (number: string, counterpartyId: number) =>
    api.deal
      .patch(`${dealPath(number)}/counterparty/${counterpartyId}`, { json: { is_primary: true } })
      .json<DealCard>(),
  /** Вместе с контрагентом отвязываются и его контакты (на стороне Xano) */
  unlinkCounterparty: (number: string, counterpartyId: number) =>
    api.deal.delete(`${dealPath(number)}/counterparty/${counterpartyId}`).json<DealCard>(),

  /* связи с контактами */
  linkContact: (number: string, contactId: number, isPrimary: boolean) =>
    api.deal
      .post(`${dealPath(number)}/contact`, {
        json: { contact_id: contactId, is_primary: isPrimary },
      })
      .json<DealCard>(),
  setPrimaryContact: (number: string, contactId: number) =>
    api.deal
      .patch(`${dealPath(number)}/contact/${contactId}`, { json: { is_primary: true } })
      .json<DealCard>(),
  unlinkContact: (number: string, contactId: number) =>
    api.deal.delete(`${dealPath(number)}/contact/${contactId}`).json<DealCard>(),
};

export const useDeals = (params: DealListParams) =>
  useQuery({
    queryKey: dealKeys.list(params),
    queryFn: () => dealApi.list(params),
    placeholderData: keepPreviousData, // таблица не мигает при смене страницы/фильтра
  });

export const useDeal = (number: string) =>
  useQuery({
    queryKey: dealKeys.card(number),
    queryFn: () => dealApi.get(number),
  });

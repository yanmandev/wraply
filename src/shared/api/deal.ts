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

  get: (number: string) => api.deal.get(`deal/${encodeURIComponent(number)}`).json<DealCard>(),

  create: (payload: CreateDealPayload) => api.deal.post('deal', { json: payload }).json<DealCard>(),
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

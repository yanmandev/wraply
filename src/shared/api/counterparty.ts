import { useQuery } from '@tanstack/react-query';
import type { Paged } from '@shared/types/api';
import type { Counterparty } from '@shared/types/deal';
import { api } from './http';

export type CounterpartyPayload = Omit<Counterparty, 'id' | 'created_at' | 'updated_at'>;

export const counterpartyKeys = {
  search: (search: string) => ['counterparty', 'search', search] as const,
};

export const counterpartyApi = {
  search: (search: string) =>
    api.counterparty
      .get('counterparty', { searchParams: { search, per_page: 20 } })
      .json<Paged<Counterparty>>(),

  create: (payload: CounterpartyPayload) =>
    api.counterparty.post('counterparty', { json: payload }).json<Counterparty>(),
};

/** Поиск для автокомплита; пустая строка — первые записи по алфавиту */
export const useCounterpartySearch = (search: string) =>
  useQuery({
    queryKey: counterpartyKeys.search(search),
    queryFn: () => counterpartyApi.search(search),
    select: (data) => data.items,
  });

/** Название для списков: сокращённое, если есть */
export const counterpartyName = (c: Pick<Counterparty, 'short_name' | 'full_name'>) =>
  c.short_name || c.full_name;

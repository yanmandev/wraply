import { useQuery } from '@tanstack/react-query';
import type { CounterpartyContact } from '@shared/types/deal';
import { api } from './http';

export type ContactPayload = Pick<
  CounterpartyContact,
  'counterparty_id' | 'name' | 'phone' | 'note'
>;

export const contactKeys = {
  byCounterparty: (counterpartyId: number) => ['contact', 'counterparty', counterpartyId] as const,
};

export const contactApi = {
  list: (counterpartyId: number) =>
    api.contact
      .get('contact', { searchParams: { counterparty_id: counterpartyId } })
      .json<CounterpartyContact[]>(),

  create: (payload: ContactPayload) =>
    api.contact.post('contact', { json: payload }).json<CounterpartyContact>(),

  update: (id: number, payload: Omit<ContactPayload, 'counterparty_id'>) =>
    api.contact.patch(`contact/${id}`, { json: payload }).json<CounterpartyContact>(),
};

export const useCounterpartyContacts = (counterpartyId: number) =>
  useQuery({
    queryKey: contactKeys.byCounterparty(counterpartyId),
    queryFn: () => contactApi.list(counterpartyId),
  });

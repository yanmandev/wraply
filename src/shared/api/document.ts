import { useQuery } from '@tanstack/react-query';
import type { DealDocument, DealDocumentPayload, OurEntity } from '@shared/types/document';
import { api } from './http';

const docsPath = (number: string) => `deal/${encodeURIComponent(number)}/document`;

export const documentKeys = {
  list: (number: string) => ['deal', 'documents', number] as const,
  ourEntities: ['our_entity'] as const,
};

/**
 * Документы сделки. Файл — ссылкой (file_url): загрузка файлов в хранилище Xano
 * недоступна на бесплатном тарифе («Not supported. Please upgrade your Xano instance»).
 */
export const documentApi = {
  list: (number: string) => api.deal.get(docsPath(number)).json<DealDocument[]>(),

  create: (number: string, payload: DealDocumentPayload) =>
    api.deal.post(docsPath(number), { json: payload }).json<{ id: number }>(),

  update: (number: string, id: number, payload: DealDocumentPayload) =>
    api.deal.patch(`${docsPath(number)}/${id}`, { json: payload }).json<{ id: number }>(),

  remove: (number: string, id: number) =>
    api.deal.delete(`${docsPath(number)}/${id}`).json<{ success: boolean }>(),
};

export const ourEntityApi = {
  list: () => api.deal.get('our_entity').json<OurEntity[]>(),
};

export const useDealDocuments = (number: string) =>
  useQuery({
    queryKey: documentKeys.list(number),
    queryFn: () => documentApi.list(number),
  });

/** Наши юрлица меняются редко — кэшируем надолго */
export const useOurEntities = () =>
  useQuery({
    queryKey: documentKeys.ourEntities,
    queryFn: ourEntityApi.list,
    staleTime: 10 * 60_000,
  });

/**
 * Название файла из ссылки: «…/Счёт_112.pdf?dl=1» → «Счёт_112.pdf».
 * Только если последний сегмент похож на имя файла (есть расширение): у Google Drive
 * и Яндекс.Диска ссылки вида /file/d/<id>/view — там имени нет, вернём null.
 */
export function fileNameFromUrl(url: string): string | null {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop();
    if (!last) return null;
    const name = decodeURIComponent(last);
    return /\.[a-z0-9]{2,5}$/i.test(name) ? name : null;
  } catch {
    return null;
  }
}

/** Ответ Xano для db.query с paging + totals */
export interface Paged<T> {
  items: T[];
  itemsReceived: number;
  itemsTotal: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  pageTotal: number;
  offset: number;
  perPage?: number;
}

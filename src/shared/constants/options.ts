/** Значение enum → подпись. Из такой карты строим опции для Select */
export type LabelMap<K extends string> = Readonly<Record<K, string>>;

export interface Option<K extends string = string> {
  value: K;
  label: string;
}

export const toOptions = <K extends string>(map: LabelMap<K>): Option<K>[] =>
  (Object.keys(map) as K[]).map((value) => ({ value, label: map[value] }));

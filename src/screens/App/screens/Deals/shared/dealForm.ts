/**
 * Форма сделки — общая для мастера создания и страницы редактирования:
 * схема Zod, значения по умолчанию, преобразования сервер ↔ форма ↔ API.
 */
import { z } from 'zod';
import {
  CLIENT_TYPES,
  DESIGN_SOURCES,
  INSTALL_PLACES,
  MEASUREMENT_OPTIONS,
  OLD_FILM_OPTIONS,
  PRIORITY_OPTIONS,
  QUALIFICATION_FIELDS,
} from '@shared/constants/deal';
import {
  COUNTERPARTY_FIELDS,
  COUNTERPARTY_TYPES,
  REQUISITE_LENGTH,
  type RequisiteField,
} from '@shared/constants/counterparty';
import type { CounterpartyPayload } from '@shared/api/counterparty';
import type { CreateDealPayload, QualificationPayload, UpdateDealPayload } from '@shared/api/deal';
import type { Counterparty, DealCard, DealQualification } from '@shared/types/deal';

const emptyToNull = (v: string) => (v === '' ? null : v);
const text = z.string().trim().max(2000, 'Слишком длинный текст');

/* ═══ Квалификация ═══ */

export const qualificationSchema = z.object({
  vehicle_count: z.number().int('Целое число').min(0, 'Не меньше 0').nullable(),
  operating_conditions: text,
  install_place: z.enum(INSTALL_PLACES).nullable(),
  old_film: z.enum(OLD_FILM_OPTIONS).nullable(),
  measurement: z.enum(MEASUREMENT_OPTIONS).nullable(),
  vehicles: text,
  goal: text,
  deadline: text,
  priority: z.enum(PRIORITY_OPTIONS).nullable(),
  design: z.enum(DESIGN_SOURCES).nullable(),
  invoice_requirements: text,
});
export type QualificationValues = z.infer<typeof qualificationSchema>;

/** Вопросы квалификации без «Тип клиента» — он хранится в deal */
export const QUALIFICATION_QUESTIONS = QUALIFICATION_FIELDS.filter(
  (f): f is Extract<(typeof QUALIFICATION_FIELDS)[number], { key: keyof QualificationValues }> =>
    f.key !== 'client_type',
);

export const qualificationToForm = (q?: DealQualification | null): QualificationValues => ({
  vehicle_count: q?.vehicle_count ?? null,
  operating_conditions: q?.operating_conditions ?? '',
  install_place: q?.install_place ?? null,
  old_film: q?.old_film ?? null,
  measurement: q?.measurement ?? null,
  vehicles: q?.vehicles ?? '',
  goal: q?.goal ?? '',
  deadline: q?.deadline ?? '',
  priority: q?.priority ?? null,
  design: q?.design ?? null,
  invoice_requirements: q?.invoice_requirements ?? '',
});

export const qualificationToPayload = (q: QualificationValues): QualificationPayload => ({
  ...q,
  operating_conditions: emptyToNull(q.operating_conditions),
  vehicles: emptyToNull(q.vehicles),
  goal: emptyToNull(q.goal),
  deadline: emptyToNull(q.deadline),
  invoice_requirements: emptyToNull(q.invoice_requirements),
});

export const countFilled = (values: Record<string, unknown>, keys: readonly string[]) =>
  keys.filter((k) => values[k] !== null && values[k] !== undefined && values[k] !== '').length;

/* ═══ Реквизиты контрагента ═══ */

const DIGIT_FIELDS = ['inn', 'kpp', 'ogrn', 'okpo', 'oktmo'] as const;

export const requisitesSchema = z.object({
  type: z.enum(COUNTERPARTY_TYPES),
  inn: z.string().trim(),
  kpp: z.string().trim(),
  ogrn: z.string().trim(),
  short_name: z.string().trim(),
  full_name: z.string().trim(),
  registered_at: z.string().nullable(),
  okpo: z.string().trim(),
  oktmo: z.string().trim(),
  director: z.string().trim(),
  accountant: z.string().trim(),
  address: z.string().trim(),
});
export type RequisitesValues = z.infer<typeof requisitesSchema>;

/** Обязательные поля и длины реквизитов зависят от типа контрагента */
export function refineRequisites(v: RequisitesValues, ctx: z.RefinementCtx) {
  const rules = COUNTERPARTY_FIELDS[v.type];
  const lengths: Partial<Record<RequisiteField, number>> = REQUISITE_LENGTH[v.type];

  for (const field of rules.required) {
    if (!v[field]) ctx.addIssue({ code: 'custom', path: [field], message: 'Обязательное поле' });
  }
  for (const field of DIGIT_FIELDS) {
    const value = v[field];
    if (!value || !rules.visible.includes(field)) continue;
    if (!/^\d+$/.test(value)) {
      ctx.addIssue({ code: 'custom', path: [field], message: 'Только цифры' });
    } else if (lengths[field] && value.length !== lengths[field]) {
      ctx.addIssue({
        code: 'custom',
        path: [field],
        message: `Должно быть ${lengths[field]} цифр`,
      });
    }
  }
}

export const emptyRequisites: RequisitesValues = {
  type: 'organization',
  inn: '',
  kpp: '',
  ogrn: '',
  short_name: '',
  full_name: '',
  registered_at: null,
  okpo: '',
  oktmo: '',
  director: '',
  accountant: '',
  address: '',
};

export const requisitesToForm = (c: Counterparty): RequisitesValues => ({
  type: c.type,
  inn: c.inn ?? '',
  kpp: c.kpp ?? '',
  ogrn: c.ogrn ?? '',
  short_name: c.short_name ?? '',
  full_name: c.full_name ?? '',
  registered_at: c.registered_at ?? null,
  okpo: c.okpo ?? '',
  oktmo: c.oktmo ?? '',
  director: c.director ?? '',
  accountant: c.accountant ?? '',
  address: c.address ?? '',
});

/** Поля, скрытые для выбранного типа, отправляем как null */
export function requisitesToPayload(v: RequisitesValues): CounterpartyPayload {
  const visible = COUNTERPARTY_FIELDS[v.type].visible;
  const pick = (f: RequisiteField) => (visible.includes(f) && v[f] ? v[f] : null);
  return {
    type: v.type,
    inn: pick('inn'),
    kpp: pick('kpp'),
    ogrn: pick('ogrn'),
    short_name: pick('short_name'),
    full_name: v.full_name,
    registered_at: pick('registered_at'),
    okpo: pick('okpo'),
    oktmo: pick('oktmo'),
    director: pick('director'),
    accountant: pick('accountant'),
    address: pick('address'),
  };
}

/* ═══ Сделка целиком ═══ */

const counterpartyItem = requisitesSchema.extend({ id: z.number() });
export type CounterpartyItem = z.infer<typeof counterpartyItem>;

/**
 * strictRequisites — проверять реквизиты контрагентов (на странице сделки их редактируют).
 * В мастере реквизиты только показываются, проверять их там незачем.
 */
export const createDealFormSchema = ({ strictRequisites }: { strictRequisites: boolean }) =>
  z.object({
    name: z.string().trim().min(1, 'Укажите название сделки').max(200, 'Не длиннее 200 символов'),
    client_type: z.enum(CLIENT_TYPES).nullable(),
    mop_id: z.number().nullable(),
    mos_id: z.number().nullable(),

    counterparties: z
      .array(strictRequisites ? counterpartyItem.superRefine(refineRequisites) : counterpartyItem)
      .min(1, 'Добавьте хотя бы одного контрагента'),
    primary_counterparty_id: z.number().nullable(),
    contacts: z.array(z.object({ id: z.number(), counterparty_id: z.number() })),
    primary_contact_id: z.number().nullable(),

    qualification: qualificationSchema,
  });

export type DealFormValues = z.infer<ReturnType<typeof createDealFormSchema>>;

export const counterpartyToItem = (c: Counterparty): CounterpartyItem => ({
  id: c.id,
  ...requisitesToForm(c),
});

export const emptyDealForm = (mopId: number | null): DealFormValues => ({
  name: '',
  client_type: null,
  mop_id: mopId,
  mos_id: null,
  counterparties: [],
  primary_counterparty_id: null,
  contacts: [],
  primary_contact_id: null,
  qualification: qualificationToForm(null),
});

/** Карточка с сервера → значения формы редактирования */
export const cardToForm = (card: DealCard): DealFormValues => ({
  name: card.name,
  client_type: card.client_type,
  mop_id: card.mop_id,
  mos_id: card.mos_id,
  counterparties: card.counterparties.map(counterpartyToItem),
  primary_counterparty_id: card.counterparties.find((c) => c.is_primary)?.id ?? null,
  contacts: card.contacts.map((c) => ({ id: c.id, counterparty_id: c.counterparty_id })),
  primary_contact_id: card.contacts.find((c) => c.is_primary)?.id ?? null,
  qualification: qualificationToForm(card.qualification),
});

export const toCreatePayload = (v: DealFormValues): CreateDealPayload => ({
  name: v.name,
  client_type: v.client_type,
  mop_id: v.mop_id,
  mos_id: v.mos_id,
  counterparty_ids: v.counterparties.map((c) => c.id),
  primary_counterparty_id: v.primary_counterparty_id,
  contact_ids: v.contacts.map((c) => c.id),
  primary_contact_id: v.primary_contact_id,
  qualification: qualificationToPayload(v.qualification),
});

export const toUpdatePayload = (v: DealFormValues): UpdateDealPayload => ({
  name: v.name,
  client_type: v.client_type,
  mop_id: v.mop_id,
  mos_id: v.mos_id,
});

/** Название контрагента для заголовков: сокращённое, если есть */
export const itemName = (c: Pick<CounterpartyItem, 'short_name' | 'full_name'>) =>
  c.short_name || c.full_name || 'Без названия';

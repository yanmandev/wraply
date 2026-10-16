import { z } from 'zod';
import {
  CLIENT_TYPES,
  DESIGN_SOURCES,
  INSTALL_PLACES,
  MEASUREMENT_OPTIONS,
  OLD_FILM_OPTIONS,
  PRIORITY_OPTIONS,
} from '@shared/constants/deal';
import { COUNTERPARTY_TYPES } from '@shared/constants/counterparty';
import type { CreateDealPayload } from '@shared/api/deal';

const text = z.string().trim().max(2000, 'Слишком длинный текст');

export const dealFormSchema = z.object({
  /* шаг 1 — основное */
  name: z.string().trim().min(1, 'Укажите название сделки').max(200, 'Не длиннее 200 символов'),
  client_type: z.enum(CLIENT_TYPES).nullable(),
  mop_id: z.number().nullable(),
  mos_id: z.number().nullable(),

  /* шаг 2 — клиент */
  counterparties: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        type: z.enum(COUNTERPARTY_TYPES),
        inn: z.string().nullable(),
      }),
    )
    .min(1, 'Добавьте хотя бы одного контрагента'),
  primary_counterparty_id: z.number().nullable(),
  contacts: z.array(z.object({ id: z.number(), counterparty_id: z.number() })),
  primary_contact_id: z.number().nullable(),

  /* шаг 3 — квалификация (всё необязательно) */
  qualification: z.object({
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
  }),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;
export type QualificationValues = DealFormValues['qualification'];

/** Поля каждого шага — для проверки перед переходом дальше */
export const STEP_FIELDS = [
  ['name', 'client_type', 'mop_id', 'mos_id'],
  ['counterparties', 'primary_counterparty_id', 'contacts', 'primary_contact_id'],
  ['qualification'],
] as const satisfies readonly (readonly (keyof DealFormValues)[])[];

export const getDefaultValues = (mopId: number | null): DealFormValues => ({
  name: '',
  client_type: null,
  mop_id: mopId,
  mos_id: null,
  counterparties: [],
  primary_counterparty_id: null,
  contacts: [],
  primary_contact_id: null,
  qualification: {
    vehicle_count: null,
    operating_conditions: '',
    install_place: null,
    old_film: null,
    measurement: null,
    vehicles: '',
    goal: '',
    deadline: '',
    priority: null,
    design: null,
    invoice_requirements: '',
  },
});

const emptyToNull = (v: string) => (v === '' ? null : v);

export function toCreatePayload(v: DealFormValues): CreateDealPayload {
  const q = v.qualification;
  return {
    name: v.name,
    client_type: v.client_type,
    mop_id: v.mop_id,
    mos_id: v.mos_id,
    counterparty_ids: v.counterparties.map((c) => c.id),
    primary_counterparty_id: v.primary_counterparty_id,
    contact_ids: v.contacts.map((c) => c.id),
    primary_contact_id: v.primary_contact_id,
    qualification: {
      ...q,
      operating_conditions: emptyToNull(q.operating_conditions),
      vehicles: emptyToNull(q.vehicles),
      goal: emptyToNull(q.goal),
      deadline: emptyToNull(q.deadline),
      invoice_requirements: emptyToNull(q.invoice_requirements),
    },
  };
}

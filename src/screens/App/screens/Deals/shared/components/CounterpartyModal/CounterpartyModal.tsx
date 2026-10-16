import { DatePicker, Form, Input, Modal, Segmented } from 'antd';
import NiceModal, { antdModalV5, useModal } from '@ebay/nice-modal-react';
import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  COUNTERPARTY_FIELDS,
  COUNTERPARTY_TYPES,
  counterpartyTypeOptions,
  REQUISITE_LENGTH,
  requisiteLabel,
  type CounterpartyType,
  type RequisiteField,
} from '@shared/constants/counterparty';
import { counterpartyApi } from '@shared/api/counterparty';
import { FormField } from '@shared/components/FormField';
import { dayjs } from '@shared/lib/date';
import type { Counterparty } from '@shared/types/deal';
import s from './CounterpartyModal.module.less';

const DIGIT_FIELDS = ['inn', 'kpp', 'ogrn', 'okpo', 'oktmo'] as const;
const WIDE_FIELDS: RequisiteField[] = ['full_name', 'short_name', 'address'];

const schema = z
  .object({
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
  })
  .superRefine((v, ctx) => {
    const rules = COUNTERPARTY_FIELDS[v.type];
    const lengths: Partial<Record<RequisiteField, number>> = REQUISITE_LENGTH[v.type];

    for (const field of rules.required) {
      if (!v[field]) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Обязательное поле' });
      }
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
  });

type Values = z.infer<typeof schema>;

const defaults: Values = {
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

/**
 * Новый контрагент. Возвращает созданную запись:
 *   const cp = await NiceModal.show(CounterpartyModal) as Counterparty | undefined
 */
export const CounterpartyModal = NiceModal.create(() => {
  const modal = useModal();
  const { control, handleSubmit } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const type = useWatch({ control, name: 'type' });
  const visible = COUNTERPARTY_FIELDS[type].visible;
  const required = COUNTERPARTY_FIELDS[type].required;

  const create = useMutation({ mutationFn: counterpartyApi.create });

  const onSubmit = handleSubmit(async (v) => {
    // Поля, скрытые для выбранного типа, не отправляем
    const pick = (f: RequisiteField) => (visible.includes(f) && v[f] ? v[f] : null);
    // ошибку покажет общий тост мутаций (queryClient) — окно остаётся открытым
    const created = await create
      .mutateAsync({
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
      })
      .catch(() => null);
    if (!created) return;
    modal.resolve(created satisfies Counterparty);
    modal.hide();
  });

  const close = () => {
    modal.resolve(undefined);
    modal.hide();
  };

  return (
    <Modal
      {...antdModalV5(modal)}
      title="Новый контрагент"
      width={680}
      okText="Создать"
      cancelText="Отмена"
      onOk={onSubmit}
      onCancel={close}
      okButtonProps={{ loading: create.isPending }}
      mask={{ closable: false }}
    >
      <Form layout="vertical" component={false} requiredMark>
        <FormField control={control} name="type" label="Тип">
          {(field) => (
            <Segmented<CounterpartyType>
              options={counterpartyTypeOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        </FormField>

        <div className={s.grid}>
          {visible.map((name) => (
            <FormField
              key={name}
              control={control}
              name={name}
              label={requisiteLabel(type, name)}
              required={required.includes(name)}
              className={WIDE_FIELDS.includes(name) ? s.wide : undefined}
            >
              {(field) =>
                name === 'registered_at' ? (
                  <DatePicker
                    id={field.id}
                    className={s.full}
                    format="DD.MM.YYYY"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : null)}
                  />
                ) : (
                  <Input
                    id={field.id}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputMode={
                      (DIGIT_FIELDS as readonly string[]).includes(name) ? 'numeric' : undefined
                    }
                  />
                )
              }
            </FormField>
          ))}
        </div>
      </Form>
    </Modal>
  );
});

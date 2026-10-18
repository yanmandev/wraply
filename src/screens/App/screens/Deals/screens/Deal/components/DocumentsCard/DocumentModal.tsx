import { useEffect } from 'react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import NiceModal, { antdModalV5, useModal } from '@ebay/nice-modal-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import {
  DOC_EXCHANGES,
  DOC_STATUS_LABEL,
  DOC_STATUSES,
  DOC_STATUSES_BY_TYPE,
  DOC_TYPES,
  DOC_TYPES_WITH_AMOUNT,
  DOC_TYPES_WITH_PAYMENT,
  docExchangeOptions,
  docTypeOptions,
  PAYMENT_TERMS,
  paymentTermsOptions,
  type DocType,
} from '@shared/constants/document';
import { documentApi, documentKeys, fileNameFromUrl, useOurEntities } from '@shared/api/document';
import { FormField } from '@shared/components/FormField';
import { dayjs } from '@shared/lib/date';
import type { DealDocument, DealDocumentPayload } from '@shared/types/document';
import s from './DocumentsCard.module.less';

const schema = z.object({
  type: z.enum(DOC_TYPES),
  title: z.string().trim().min(1, 'Укажите название').max(200),
  doc_number: z.string().trim().max(50),
  doc_date: z.string().nullable(),
  amount: z.number().min(0, 'Не меньше 0').nullable(),
  pay_date: z.string().nullable(),
  payment_terms: z.enum(PAYMENT_TERMS).nullable(),
  status: z.enum(DOC_STATUSES),
  exchange: z.enum(DOC_EXCHANGES),
  our_entity_id: z.number().nullable(),
  counterparty_id: z.number().nullable(),
  comment: z.string().trim().max(500),
  file_url: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (v) => v === '' || /^https?:\/\/\S+$/i.test(v),
      'Ссылка должна начинаться с http:// или https://',
    ),
});
type Values = z.infer<typeof schema>;

/** Тип по имени файла: «Счёт №112.pdf» → Счёт и т.п. */
function guessType(filename: string): DocType {
  const n = filename.toLowerCase();
  // кириллица и транслит: файлы часто называют латиницей (schet_112.pdf, UPD_98.pdf)
  if (/сч[её]т[-_ ]?фактур|schet[-_ ]?faktur|sf[-_]?\d/.test(n)) return 'invoice_factura';
  if (/сч[её]т|schet|sch[-_]?\d|invoice/.test(n)) return 'invoice';
  if (/упд|акт|upd|akt|\bact/.test(n)) return 'act_upd';
  if (/договор|dogovor|contract/.test(n)) return 'contract';
  if (/специфик|specif/.test(n)) return 'specification';
  return 'other';
}

/** Имя файла без расширения — название документа по умолчанию */
const baseName = (filename: string) => filename.replace(/\.[^.]+$/, '');

const today = () => dayjs().format('YYYY-MM-DD');

interface Props {
  dealNumber: string;
  /** передан — редактирование */
  document?: DealDocument;
  counterparties: { id: number; name: string; is_primary: boolean }[];
}

/** Создание / изменение документа сделки. Сохраняет сразу (документ — отдельная сущность) */
export const DocumentModal = NiceModal.create(({ dealNumber, document, counterparties }: Props) => {
  const modal = useModal();
  const queryClient = useQueryClient();
  const entities = useOurEntities();

  const startType = document?.type ?? 'invoice';
  const { control, handleSubmit, setValue, getValues } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: startType,
      title: document?.title ?? '',
      doc_number: document?.number ?? '',
      doc_date: document?.doc_date ?? null,
      amount: document?.amount ?? null,
      pay_date: document ? document.pay_date : startType === 'invoice' ? today() : null,
      payment_terms: document?.payment_terms ?? (startType === 'invoice' ? 'postpay_30' : null),
      status: document?.status ?? 'uploaded',
      exchange: document?.exchange ?? 'edo',
      our_entity_id: document?.our_entity_id ?? null,
      counterparty_id:
        document?.counterparty_id ?? counterparties.find((c) => c.is_primary)?.id ?? null,
      comment: document?.comment ?? '',
      file_url: document?.file_url ?? '',
    },
  });

  const [type, status, ourEntityId] = useWatch({
    control,
    name: ['type', 'status', 'our_entity_id'],
  });
  const hasAmount = DOC_TYPES_WITH_AMOUNT.includes(type);
  const hasPayment = DOC_TYPES_WITH_PAYMENT.includes(type);

  // Новым документам — только активные юрлица; у старого оставляем и его неактивное
  const entityOptions = (entities.data ?? [])
    .filter((e) => e.is_active || e.id === document?.our_entity_id)
    .map((e) => ({ value: e.id, label: e.short_name }));
  // по умолчанию — первое активное юрлицо (список приходит асинхронно)
  const firstEntityId = entityOptions[0]?.value;
  useEffect(() => {
    if (!document && firstEntityId !== undefined && getValues('our_entity_id') === null) {
      setValue('our_entity_id', firstEntityId);
    }
  }, [document, firstEntityId, getValues, setValue]);
  const vatRate = entities.data?.find((e) => e.id === ourEntityId)?.vat_rate ?? null;

  // Статусы, осмысленные для типа; текущий оставляем, даже если он «не из этого типа»
  const statusList = DOC_STATUSES_BY_TYPE[type].includes(status)
    ? DOC_STATUSES_BY_TYPE[type]
    : [...DOC_STATUSES_BY_TYPE[type], status];

  const onTypeChange = (next: DocType) => {
    setValue('type', next, { shouldDirty: true });
    if (!DOC_STATUSES_BY_TYPE[next].includes(getValues('status'))) {
      setValue('status', DOC_STATUSES_BY_TYPE[next][0]);
    }
    if (DOC_TYPES_WITH_PAYMENT.includes(next)) {
      if (!getValues('pay_date')) setValue('pay_date', today());
      if (!getValues('payment_terms')) setValue('payment_terms', 'postpay_30');
    }
  };

  /** Новому документу без названия — название и тип из имени файла в ссылке */
  const onLinkBlur = () => {
    const name = fileNameFromUrl(getValues('file_url'));
    if (document || !name || getValues('title')) return;
    setValue('title', baseName(name), { shouldValidate: true });
    onTypeChange(guessType(name));
  };

  const save = useMutation({
    mutationFn: (v: Values) => {
      const payload: DealDocumentPayload = {
        ...v,
        doc_number: v.doc_number || null,
        comment: v.comment || null,
        file_url: v.file_url || null,
        file_name: v.file_url ? (fileNameFromUrl(v.file_url) ?? document?.file_name ?? null) : null,
        // поля, которых нет у типа, не отправляем (сервер их и так обнулит)
        amount: hasAmount ? v.amount : null,
        pay_date: hasPayment ? v.pay_date : null,
        payment_terms: hasPayment ? v.payment_terms : null,
      };
      return document
        ? documentApi.update(dealNumber, document.id, payload)
        : documentApi.create(dealNumber, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.list(dealNumber) }),
  });

  const onSubmit = handleSubmit(async (v) => {
    const saved = await save.mutateAsync(v).catch(() => null); // ошибку покажет общий тост
    if (!saved) return;
    modal.resolve(saved);
    modal.hide();
  });

  const close = () => {
    modal.resolve(undefined);
    modal.hide();
  };

  const dateField = (name: 'doc_date' | 'pay_date', label: string) => (
    <FormField control={control} name={name} label={label}>
      {(field) => (
        <DatePicker
          id={field.id}
          className={s.full}
          format="DD.MM.YYYY"
          value={field.value ? dayjs(field.value) : null}
          onChange={(d) => field.onChange(d ? d.format('YYYY-MM-DD') : null)}
        />
      )}
    </FormField>
  );

  return (
    <Modal
      {...antdModalV5(modal)}
      title={document ? 'Документ' : 'Новый документ'}
      width={640}
      okText={document ? 'Сохранить' : 'Добавить'}
      cancelText="Отмена"
      onOk={onSubmit}
      onCancel={close}
      okButtonProps={{ loading: save.isPending }}
      mask={{ closable: false }}
    >
      <Form layout="vertical" component={false}>
        <FormField
          control={control}
          name="file_url"
          label="Ссылка на файл"
          hint="Яндекс.Диск, Google Drive и т.п. — файл должен открываться по ссылке"
          className={s.fileItem}
        >
          {(field) => (
            <Input
              {...field}
              type="url"
              inputMode="url"
              autoFocus={!document}
              placeholder="https://disk.yandex.ru/…"
              onBlur={() => {
                field.onBlur();
                onLinkBlur();
              }}
            />
          )}
        </FormField>

        <div className={s.grid}>
          <FormField control={control} name="type" label="Тип" required>
            {(field) => (
              <Select
                id={field.id}
                options={docTypeOptions}
                value={field.value}
                onChange={onTypeChange}
              />
            )}
          </FormField>
          <FormField control={control} name="status" label="Статус" required>
            {(field) => (
              <Select
                id={field.id}
                options={statusList.map((st) => ({ value: st, label: DOC_STATUS_LABEL[st] }))}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          </FormField>

          <FormField control={control} name="title" label="Название" required className={s.wide}>
            {(field) => <Input {...field} placeholder="Счёт №112 от 14.08.2026" />}
          </FormField>

          <FormField control={control} name="doc_number" label="Номер">
            {(field) => <Input {...field} placeholder="112" />}
          </FormField>
          {dateField('doc_date', 'Дата документа')}

          {hasAmount && (
            <FormField
              control={control}
              name="amount"
              label="Сумма"
              hint={vatRate ? `с НДС ${vatRate}%` : 'без НДС'}
            >
              {(field) => (
                <NumericFormat
                  id={field.id}
                  customInput={Input}
                  addonAfter="₽"
                  inputMode="decimal"
                  thousandSeparator=" "
                  decimalSeparator=","
                  allowedDecimalSeparators={['.', ',']}
                  decimalScale={2}
                  allowNegative={false}
                  value={field.value}
                  onValueChange={(v) => field.onChange(v.floatValue ?? null)}
                  onBlur={field.onBlur}
                />
              )}
            </FormField>
          )}
          {hasPayment && dateField('pay_date', 'Дата оплаты')}
          {hasPayment && (
            <FormField control={control} name="payment_terms" label="Способ оплаты">
              {(field) => (
                <Select
                  id={field.id}
                  allowClear
                  options={paymentTermsOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? null)}
                />
              )}
            </FormField>
          )}

          <FormField control={control} name="exchange" label="Обмен документов">
            {(field) => (
              <Select
                id={field.id}
                options={docExchangeOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          </FormField>
          <FormField control={control} name="our_entity_id" label="Наши реквизиты">
            {(field) => (
              <Select
                id={field.id}
                allowClear
                loading={entities.isLoading}
                options={entityOptions}
                value={field.value}
                onChange={(v) => field.onChange(v ?? null)}
              />
            )}
          </FormField>

          {counterparties.length > 1 && (
            <FormField
              control={control}
              name="counterparty_id"
              label="Контрагент"
              className={s.wide}
            >
              {(field) => (
                <Select
                  id={field.id}
                  allowClear
                  options={counterparties.map((c) => ({ value: c.id, label: c.name }))}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? null)}
                />
              )}
            </FormField>
          )}

          <FormField control={control} name="comment" label="Комментарий" className={s.wide}>
            {(field) => <Input.TextArea {...field} rows={2} placeholder="заметка" />}
          </FormField>
        </div>
      </Form>
    </Modal>
  );
});

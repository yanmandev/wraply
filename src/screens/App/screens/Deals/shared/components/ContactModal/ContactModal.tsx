import { Form, Input, Modal } from 'antd';
import NiceModal, { antdModalV5, useModal } from '@ebay/nice-modal-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatternFormat } from 'react-number-format';
import { z } from 'zod';
import { contactApi, contactKeys } from '@shared/api/contact';
import { dealKeys } from '@shared/api/deal';
import { FormField } from '@shared/components/FormField';
import { PHONE_MASK, phoneToDigits, phoneToStorage } from '@shared/lib/phone';
import type { CounterpartyContact } from '@shared/types/deal';

const schema = z.object({
  name: z.string().trim().min(1, 'Укажите имя').max(120),
  // 10 цифр без +7 (значение поля с маской)
  phone: z.string().refine((v) => v === '' || v.length === 10, 'Номер из 10 цифр после +7'),
  note: z.string().trim().max(200),
});

type Values = z.infer<typeof schema>;

interface Props {
  counterpartyId: number;
  counterpartyName: string;
  /** передан — редактирование существующего контакта */
  contact?: CounterpartyContact;
}

/**
 * Создание или редактирование контакта контрагента. Сохраняет сразу (контакт — общая
 * сущность контрагента, не часть формы сделки). Возвращает сохранённый контакт:
 *   const c = await NiceModal.show(ContactModal, { counterpartyId, counterpartyName })
 */
export const ContactModal = NiceModal.create(
  ({ counterpartyId, counterpartyName, contact }: Props) => {
    const modal = useModal();
    const queryClient = useQueryClient();
    const { control, handleSubmit } = useForm<Values>({
      resolver: zodResolver(schema),
      defaultValues: {
        name: contact?.name ?? '',
        phone: phoneToDigits(contact?.phone),
        note: contact?.note ?? '',
      },
    });

    const save = useMutation({
      mutationFn: (v: Values) => {
        const payload = { name: v.name, phone: phoneToStorage(v.phone), note: v.note || null };
        return contact
          ? contactApi.update(contact.id, payload)
          : contactApi.create({ ...payload, counterparty_id: counterpartyId });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: contactKeys.byCounterparty(counterpartyId) });
        // имя/телефон могли показываться в карточке сделки
        if (contact) queryClient.invalidateQueries({ queryKey: dealKeys.all });
      },
    });

    const onSubmit = handleSubmit(async (v) => {
      const saved = await save.mutateAsync(v).catch(() => null); // ошибку покажет общий тост
      if (!saved) return;
      modal.resolve(saved satisfies CounterpartyContact);
      modal.hide();
    });

    const close = () => {
      modal.resolve(undefined);
      modal.hide();
    };

    return (
      <Modal
        {...antdModalV5(modal)}
        title={`${contact ? 'Контакт' : 'Новый контакт'} · ${counterpartyName}`}
        width={440}
        okText={contact ? 'Сохранить' : 'Добавить'}
        cancelText="Отмена"
        onOk={onSubmit}
        onCancel={close}
        okButtonProps={{ loading: save.isPending }}
      >
        <Form layout="vertical" component={false}>
          <FormField control={control} name="name" label="Имя" required>
            {(field) => <Input {...field} autoFocus placeholder="Александр" />}
          </FormField>

          <FormField control={control} name="phone" label="Телефон">
            {(field) => (
              <PatternFormat
                id={field.id}
                customInput={Input}
                format={PHONE_MASK}
                mask="_"
                inputMode="tel"
                placeholder="+7 (___) ___-__-__"
                value={field.value}
                onValueChange={(v) => field.onChange(v.value)}
                onBlur={field.onBlur}
              />
            )}
          </FormField>

          <FormField
            control={control}
            name="note"
            label="Примечание"
            hint="Роль: водитель, логист…"
          >
            {(field) => <Input {...field} placeholder="водитель" />}
          </FormField>
        </Form>
      </Modal>
    );
  },
);

import { Form, Modal, Segmented } from 'antd';
import NiceModal, { antdModalV5, useModal } from '@ebay/nice-modal-react';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { counterpartyTypeOptions, type CounterpartyType } from '@shared/constants/counterparty';
import { counterpartyApi } from '@shared/api/counterparty';
import { FormField } from '@shared/components/FormField';
import type { Counterparty } from '@shared/types/deal';
import {
  emptyRequisites,
  refineRequisites,
  requisitesSchema,
  requisitesToPayload,
  type RequisitesValues,
} from '../../dealForm';
import { RequisitesFields } from '../RequisitesFields';

const schema = requisitesSchema.superRefine(refineRequisites);

/**
 * Новый контрагент. Возвращает созданную запись:
 *   const cp = await NiceModal.show(CounterpartyModal) as Counterparty | undefined
 */
export const CounterpartyModal = NiceModal.create(() => {
  const modal = useModal();
  const form = useForm<RequisitesValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyRequisites,
  });
  const type = useWatch({ control: form.control, name: 'type' });

  const create = useMutation({ mutationFn: counterpartyApi.create });

  const onSubmit = form.handleSubmit(async (v) => {
    // ошибку покажет общий тост мутаций (queryClient) — окно остаётся открытым
    const created = await create.mutateAsync(requisitesToPayload(v)).catch(() => null);
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
      <FormProvider {...form}>
        <Form layout="vertical" component={false}>
          <FormField control={form.control} name="type" label="Тип">
            {(field) => (
              <Segmented<CounterpartyType>
                options={counterpartyTypeOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          </FormField>
          <RequisitesFields type={type} />
        </Form>
      </FormProvider>
    </Modal>
  );
});

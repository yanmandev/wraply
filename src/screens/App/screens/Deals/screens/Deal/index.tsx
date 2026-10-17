import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Empty, Form, Skeleton } from 'antd';
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { HTTPError } from 'ky';
import { toast } from 'sonner';
import NiceModal from '@ebay/nice-modal-react';
import { dealApi, dealKeys, useDeal } from '@shared/api/deal';
import { getErrorMessage } from '@shared/api/http';
import type { DealCard } from '@shared/types/deal';
import { DEAL_STATUS_LABEL, type DealStatus } from '@shared/constants/deal';
import { ConfirmModal } from '@shared/components/ConfirmModal';
import { PageBody, PageHeader, PageTitle } from '@app/shared/components/Page';
import {
  cardToForm,
  createDealFormSchema,
  toUpdatePayload,
  type DealFormValues,
} from '../../shared/dealForm';
import { DealHeader } from './components/DealHeader';
import { QualificationCard } from './components/QualificationCard';
import { ClientCard } from './components/ClientCard';
import { DealFunnel } from './components/DealFunnel';
import { HelpCard } from './components/HelpCard';
import { saveDeal } from './saveDeal';
import { useLeaveGuard } from './useLeaveGuard';
import s from './Deal.module.less';

// На странице сделки реквизиты редактируются — проверяем их
const schema = createDealFormSchema({ strictRequisites: true });

/** Поля, которые живут в блоке «Квалификация» (раскрываем его при ошибке) */
const QUALIFICATION_BLOCK: (keyof DealFormValues)[] = [
  'qualification',
  'client_type',
  'mop_id',
  'mos_id',
];

/** Страница сделки: загрузка карточки по номеру из URL */
export default function Deal() {
  const { number = '' } = useParams();
  const { data: card, isLoading, error } = useDeal(number);

  if (card) return <DealEditor key={card.id} number={number} card={card} />;

  return (
    <>
      <PageHeader>
        <Link to="/deals" className={s.back}>
          ← Сделки
        </Link>
        <PageTitle>{number}</PageTitle>
      </PageHeader>
      <PageBody>
        {isLoading ? (
          <Skeleton active />
        ) : error instanceof HTTPError && error.response.status === 404 ? (
          <Empty description={`Сделка ${number} не найдена`}>
            <Link to="/deals">К списку сделок</Link>
          </Empty>
        ) : (
          <Alert
            type="error"
            showIcon
            title="Не удалось загрузить сделку"
            description={getErrorMessage(error)}
          />
        )}
      </PageBody>
    </>
  );
}

/** Редактирование сделки: одна форма на все блоки, сохранение кнопкой в шапке */
function DealEditor({ number, card }: { number: string; card: DealCard }) {
  const queryClient = useQueryClient();
  const [qualificationOpen, setQualificationOpen] = useState(false);

  // Состояние на сервере — от него считаем, что изменилось (обновляется после сохранения)
  const [initial] = useState(() => cardToForm(card));
  const base = useRef<DealFormValues>(initial);
  const form = useForm<DealFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: 'onTouched',
  });
  const { isDirty } = form.formState;

  const saveKey = ['deal', 'save', number];
  const save = useMutation({
    mutationKey: saveKey,
    mutationFn: (values: DealFormValues) => saveDeal(number, base.current, values),
    onSuccess: () => toast.success('Сделка сохранена'),
    onSettled: async (_data, error) => {
      // Часть запросов могла пройти и при ошибке — перечитываем сделку и берём её за новую базу
      const fresh = await queryClient
        .fetchQuery({
          queryKey: dealKeys.card(number),
          queryFn: () => dealApi.get(number),
          staleTime: 0,
        })
        .catch(() => null);
      if (fresh) {
        base.current = cardToForm(fresh);
        // при ошибке оставляем введённое пользователем — он сможет поправить и сохранить снова
        form.reset(base.current, error ? { keepValues: true } : undefined);
      }
      queryClient.invalidateQueries({ queryKey: ['deal', 'list'] });
    },
  });

  const onInvalid = useCallback((errors: FieldErrors<DealFormValues>) => {
    if (QUALIFICATION_BLOCK.some((k) => k in errors)) setQualificationOpen(true);
    toast.error('Проверьте выделенные поля');
  }, []);

  // Защита от двойного сохранения: isPending из рендера может отстать (два быстрых Ctrl+S),
  // а кэш мутаций знает о запущенном сохранении сразу
  const submit = form.handleSubmit((values) => {
    if (queryClient.isMutating({ mutationKey: saveKey }) > 0) return;
    save.mutate(values);
  }, onInvalid);
  const discard = () => form.reset(base.current);

  /*
   * Смена этапа сохраняется сразу, отдельно от формы: отправляем поля сделки в том виде,
   * в каком они на сервере (base), плюс новый статус — несохранённые правки формы не уходят.
   */
  const cardKey = dealKeys.card(number);
  const changeStatus = useMutation({
    mutationFn: (status: DealStatus) =>
      dealApi.update(number, { ...toUpdatePayload(base.current), status }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: cardKey });
      const previous = queryClient.getQueryData<DealCard>(cardKey);
      // оптимистично: воронка переключается сразу
      queryClient.setQueryData<DealCard>(cardKey, (old) => old && { ...old, status });
      return { previous };
    },
    onError: (_err, _status, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(cardKey, ctx.previous);
    },
    onSuccess: (fresh, status) => {
      queryClient.setQueryData(cardKey, fresh);
      queryClient.invalidateQueries({ queryKey: ['deal', 'list'] });
      toast.success(
        status === 'completed' ? 'Сделка завершена 🎉' : `Этап: ${DEAL_STATUS_LABEL[status]}`,
      );
    },
  });

  const onStatusChange = async (status: DealStatus) => {
    if (status === 'completed') {
      const ok = await NiceModal.show(ConfirmModal, {
        title: 'Завершить сделку?',
        content: 'Сделка перейдёт в статус «Сделка завершена».',
        okText: 'Завершить',
      });
      if (!ok) return;
    }
    changeStatus.mutate(status);
  };

  useLeaveGuard(isDirty && !save.isPending);

  // Ctrl+S / ⌘S — сохранить
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        if (form.formState.isDirty) submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [form.formState, submit]);

  return (
    <FormProvider {...form}>
      <DealHeader
        number={card.number}
        ready
        isDirty={isDirty}
        saving={save.isPending}
        onSave={submit}
        onDiscard={discard}
      />
      <PageBody>
        <DealFunnel
          status={card.status}
          pending={changeStatus.isPending || save.isPending}
          onChange={onStatusChange}
        />
        <Form layout="vertical" component={false}>
          <QualificationCard
            open={qualificationOpen}
            onToggle={() => setQualificationOpen((o) => !o)}
            mop={card.mop}
            mos={card.mos}
          />
          <ClientCard />
        </Form>
        <HelpCard status={card.status} />
      </PageBody>
    </FormProvider>
  );
}

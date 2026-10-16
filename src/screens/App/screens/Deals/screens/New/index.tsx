import { useState } from 'react';
import { Button, Form, Steps } from 'antd';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { dealApi, dealKeys } from '@shared/api/deal';
import { useUserStore } from '@shared/stores/useUserStore';
import { PageBody, PageHeader, PageTitle } from '@app/shared/components/Page';
import { StepMain } from './components/StepMain';
import { StepClient } from './components/StepClient';
import { StepQualification } from './components/StepQualification';
import {
  dealFormSchema,
  getDefaultValues,
  STEP_FIELDS,
  toCreatePayload,
  type DealFormValues,
} from './schema';
import s from './NewDeal.module.less';

const STEPS = [
  { title: 'Основное', content: 'Название и ответственные', Component: StepMain },
  { title: 'Клиент', content: 'Контрагенты и контакты', Component: StepClient },
  { title: 'Квалификация', content: 'Можно заполнить позже', Component: StepQualification },
];
const LAST = STEPS.length - 1;

/** Мастер создания сделки: 3 шага, одна форма, один запрос POST /deal в конце */
export default function NewDeal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useUserStore((st) => st.user);
  const [step, setStep] = useState(0);

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    // МОП по умолчанию — текущий пользователь, если он МОП
    defaultValues: getDefaultValues(user?.role === 'mop' ? user.id : null),
    mode: 'onTouched',
  });

  const create = useMutation({
    mutationFn: dealApi.create,
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
      toast.success(`Сделка ${deal.number} создана`);
      navigate(`/deals/${encodeURIComponent(deal.number)}`, { replace: true });
    },
  });

  /** Переход вперёд только если поля текущего шага валидны */
  const goTo = async (target: number) => {
    if (target <= step) return setStep(target);
    for (let i = step; i < target; i++) {
      const ok = await form.trigger([...STEP_FIELDS[i]], { shouldFocus: true });
      if (!ok) return setStep(i);
    }
    setStep(target);
  };

  const submit = form.handleSubmit(
    (values) => create.mutate(toCreatePayload(values)),
    // ошибка в другом шаге — открываем его
    (errors) => {
      const idx = STEP_FIELDS.findIndex((fields) => fields.some((f) => f in errors));
      if (idx >= 0) setStep(idx);
    },
  );

  const { Component } = STEPS[step];

  return (
    <>
      <PageHeader>
        <Link to="/deals" className={s.back}>
          ← Сделки
        </Link>
        <PageTitle>Новая сделка</PageTitle>
      </PageHeader>

      <PageBody className={s.body}>
        <Steps
          className={s.steps}
          current={step}
          onChange={goTo}
          items={STEPS.map(({ title, content }) => ({ title, content }))}
        />

        <FormProvider {...form}>
          <form
            className={s.card}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (step === LAST) submit();
              else goTo(step + 1);
            }}
          >
            <Form layout="vertical" component={false}>
              <Component />
            </Form>

            <footer className={s.footer}>
              {step > 0 && <Button onClick={() => setStep(step - 1)}>Назад</Button>}
              <span className={s.spacer} />
              {step === LAST ? (
                <Button type="primary" htmlType="submit" loading={create.isPending}>
                  Создать сделку
                </Button>
              ) : (
                <Button type="primary" htmlType="submit">
                  Далее
                </Button>
              )}
            </footer>
          </form>
        </FormProvider>
      </PageBody>
    </>
  );
}

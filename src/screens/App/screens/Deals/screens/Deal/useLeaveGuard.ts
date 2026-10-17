import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import NiceModal from '@ebay/nice-modal-react';
import { ConfirmModal } from '@shared/components/ConfirmModal';

/** Не даёт уйти со страницы с несохранёнными изменениями (переход в приложении и закрытие вкладки) */
export function useLeaveGuard(when: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    NiceModal.show(ConfirmModal, {
      title: 'Уйти без сохранения?',
      content: 'Несохранённые изменения сделки будут потеряны.',
      okText: 'Уйти',
      cancelText: 'Остаться',
      danger: true,
    }).then((ok) => (ok ? blocker.proceed() : blocker.reset()));
  }, [blocker]);

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);
}

import type { ReactNode } from 'react';
import { Modal } from 'antd';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';

interface ConfirmModalProps {
  title: ReactNode;
  content?: ReactNode;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

/**
 * Пример модалки через NiceModal: открывается из любого места и возвращает promise.
 *   const ok = await NiceModal.show(ConfirmModal, { title: 'Удалить?' });
 */
export const ConfirmModal = NiceModal.create(
  ({ title, content, okText = 'OK', cancelText = 'Отмена', danger }: ConfirmModalProps) => {
    const modal = useModal();
    const close = (result: boolean) => {
      modal.resolve(result);
      modal.hide();
    };

    return (
      <Modal
        {...antdModalV5(modal)}
        title={title}
        okText={okText}
        cancelText={cancelText}
        okButtonProps={{ danger }}
        onOk={() => close(true)}
        onCancel={() => close(false)}
        width={400}
        centered
      >
        {content}
      </Modal>
    );
  },
);

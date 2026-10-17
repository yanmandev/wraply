import { ClientEditor } from '../../../shared/components/ClientEditor';
import s from '../Deal.module.less';

/** Клиент: контрагенты сделки с реквизитами и контакты по сделке */
export function ClientCard() {
  return (
    <section className={s.card}>
      <div className={s.cardHead}>
        <h2>Клиент</h2>
        <span className={s.sub}>компании и контакты</span>
      </div>
      <div className={s.cardBody}>
        <ClientEditor editRequisites />
      </div>
    </section>
  );
}

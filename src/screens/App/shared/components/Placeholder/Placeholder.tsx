import { Empty } from 'antd';
import { PageBody } from '../Page';
import s from './Placeholder.module.less';

/** Заглушка для разделов, которые ещё в разработке */
export function Placeholder({ title }: { title: string }) {
  return (
    <PageBody>
      <section className={s.card}>
        <h2 className={s.title}>{title}</h2>
        <Empty description="Раздел в разработке" />
      </section>
    </PageBody>
  );
}

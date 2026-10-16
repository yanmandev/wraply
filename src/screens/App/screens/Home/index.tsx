import { PageBody } from '@app/shared/components/Page';
import s from './Home.module.less';

export default function Home() {
  return (
    <PageBody>
      <h1 className={s.hello}>Hello world!</h1>
    </PageBody>
  );
}

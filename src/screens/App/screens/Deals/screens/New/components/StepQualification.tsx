import { Progress } from 'antd';
import { useFormContext, useWatch } from 'react-hook-form';
import { QualificationFields } from '../../../shared/components/QualificationFields';
import {
  countFilled,
  QUALIFICATION_QUESTIONS,
  type DealFormValues,
} from '../../../shared/dealForm';
import s from '../NewDeal.module.less';

const KEYS = QUALIFICATION_QUESTIONS.map((f) => f.key);

/** Шаг 3: квалификация (заполняет МОП, все поля необязательны) */
export function StepQualification() {
  const { control } = useFormContext<DealFormValues>();
  const values = useWatch({ control, name: 'qualification' });
  const filled = countFilled(values, KEYS);

  return (
    <>
      <div className={s.progress}>
        <Progress
          percent={Math.round((filled / KEYS.length) * 100)}
          showInfo={false}
          size="small"
          status="normal"
        />
        <span>
          {filled} из {KEYS.length}
        </span>
      </div>
      <QualificationFields />
    </>
  );
}

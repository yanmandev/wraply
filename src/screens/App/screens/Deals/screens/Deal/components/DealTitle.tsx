import { useState } from 'react';
import { Input, Tooltip } from 'antd';
import { useController, useFormContext } from 'react-hook-form';
import type { DealFormValues } from '../../../shared/dealForm';
import s from '../Deal.module.less';

/** «10001KB · Название» — название переименовывается по клику (поле формы name) */
export function DealTitle({ number }: { number: string }) {
  const { control } = useFormContext<DealFormValues>();
  const { field, fieldState } = useController({ control, name: 'name' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const start = () => {
    setDraft(field.value);
    setEditing(true);
  };
  const commit = () => {
    const next = draft.trim();
    if (next) field.onChange(next); // пустое название не принимаем — остаётся прежнее
    setEditing(false);
  };

  return (
    <span className={s.title}>
      <span className={s.number}>{number}</span>
      <span className={s.dot}>·</span>
      {editing ? (
        <Input
          className={s.titleInput}
          autoFocus
          size="small"
          maxLength={200}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
      ) : (
        <Tooltip title={fieldState.error?.message ?? 'Кликните, чтобы переименовать сделку'}>
          <button type="button" className={s.titleName} onClick={start}>
            {field.value}
            <span className={s.editIcon} aria-hidden>
              ✎
            </span>
          </button>
        </Tooltip>
      )}
    </span>
  );
}

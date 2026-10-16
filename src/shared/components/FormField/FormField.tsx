import type { ReactElement, ReactNode } from 'react';
import { Form } from 'antd';
import {
  Controller,
  type Control,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

interface FormFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  control: Control<T>;
  name: N;
  label?: ReactNode;
  required?: boolean;
  /** подсказка под полем, когда нет ошибки */
  hint?: ReactNode;
  className?: string;
  children: (field: ControllerRenderProps<T, N> & { id: string }) => ReactElement;
}

/**
 * Поле RHF в обёртке antd Form.Item: подпись, ошибка из Zod, подсветка.
 * Использовать внутри <Form layout="vertical" component={false}>.
 */
export function FormField<T extends FieldValues, N extends FieldPath<T>>({
  control,
  name,
  label,
  required,
  hint,
  className,
  children,
}: FormFieldProps<T, N>) {
  const id = `f-${name.replace(/\./g, '-')}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Form.Item
          className={className}
          label={label}
          required={required}
          htmlFor={id}
          validateStatus={fieldState.error ? 'error' : undefined}
          help={fieldState.error?.message ?? hint}
        >
          {children({ ...field, id })}
        </Form.Item>
      )}
    />
  );
}

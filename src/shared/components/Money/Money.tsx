import { NumericFormat, type NumericFormatProps } from 'react-number-format';

type MoneyProps = Omit<NumericFormatProps, 'value' | 'displayType'> & {
  value: number | string | null | undefined;
  currency?: string;
};

/** Отображение суммы в формате «1 234 567,89 ₽» */
export function Money({ value, currency = '₽', ...rest }: MoneyProps) {
  return (
    <NumericFormat
      value={value ?? 0}
      displayType="text"
      thousandSeparator=" "
      decimalSeparator=","
      decimalScale={2}
      suffix={currency ? ` ${currency}` : undefined}
      {...rest}
    />
  );
}

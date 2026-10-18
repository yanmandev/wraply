import { NumericFormat, type NumericFormatProps } from 'react-number-format';

type MoneyProps = Omit<NumericFormatProps, 'value' | 'displayType'> & {
  value: number | string | null | undefined;
  currency?: string;
};

/**
 * Сумма в формате «1 234 567,89 ₽».
 * Копейки — только если сумма дробная: 168 500 ₽, но 95 000,50 ₽ (а не «95 000,5»).
 */
export function Money({ value, currency = '₽', ...rest }: MoneyProps) {
  const fractional = Number(value ?? 0) % 1 !== 0;
  return (
    <NumericFormat
      value={value ?? 0}
      displayType="text"
      thousandSeparator=" "
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale={fractional}
      suffix={currency ? ` ${currency}` : undefined}
      {...rest}
    />
  );
}

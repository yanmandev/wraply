/** Телефоны храним как +79001234567, вводим/показываем как +7 (900) 123-45-67 */

export const PHONE_MASK = '+7 (###) ###-##-##';

/** 10 цифр без кода страны → +7XXXXXXXXXX; пусто → null */
export const phoneToStorage = (digits: string): string | null => (digits ? `+7${digits}` : null);

/** +79001234567 → 9001234567 (значение для поля с маской) */
export const phoneToDigits = (phone?: string | null): string =>
  (phone ?? '').replace(/\D/g, '').replace(/^[78](?=\d{10}$)/, '');

export function formatPhone(phone?: string | null): string {
  const d = phoneToDigits(phone);
  if (d.length !== 10) return phone ?? '';
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

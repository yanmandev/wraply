import { useEffect, useState } from 'react';

/** Значение, которое обновляется не чаще, чем раз в delay мс (поиск по мере ввода) */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

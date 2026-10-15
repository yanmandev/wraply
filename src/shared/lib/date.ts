import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.locale('ru');

export const DATE_FORMAT = 'DD.MM.YYYY';
export const DATE_TIME_FORMAT = 'DD.MM.YYYY HH:mm';

export const formatDate = (value?: dayjs.ConfigType, format = DATE_FORMAT) =>
  value ? dayjs(value).format(format) : '—';

export { dayjs };

import { format, isToday, isYesterday } from 'date-fns';
import { CURRENCY_RATES_TO_UZS } from './constants';

export const formatMoney = (value = 0, currency = 'UZS') => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
};

export const toISODate = (date) => {
  if (!date) return '';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return format(new Date(date), 'yyyy-MM-dd');
};

export const toReadableDate = (dateValue) => {
  const d = new Date(dateValue);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM dd');
};

export const convertToUZS = (amount, currency) => (Number(amount) || 0) * (CURRENCY_RATES_TO_UZS[currency] || 1);

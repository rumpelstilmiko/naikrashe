import { WARNING_DAYS } from './constants';

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('ru-RU') : '—');

export const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('ru-RU')} сом`;

export const daysLeft = (dueDate) => Math.ceil((new Date(dueDate) - Date.now()) / DAY_MS);

export const dueTone = (dueDate) => {
  const left = daysLeft(dueDate);
  if (left < 0) return 'danger';
  return left <= WARNING_DAYS ? 'warning' : 'success';
};

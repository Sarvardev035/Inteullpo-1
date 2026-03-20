import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Format currency with proper locale and currency
export const formatCurrency = (amount, currency = 'UZS') => {
  if (amount === null || amount === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    return `${currency} ${Number(amount).toLocaleString()}`;
  }
};

// Smart date display (Today, Yesterday, or formatted date)
export const smartDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
};

// Group transactions by date for display
export const groupByDate = (items) => {
  return items.reduce((groups, item) => {
    const key = smartDate(item.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
};

// Category metadata: emoji, label, background color, text color
export const getCategoryMeta = (category) => {
  const map = {
    FOOD: { emoji: '🍔', label: 'Food', bg: '#fffbeb', color: '#92400e' },
    TRANSPORT: { emoji: '🚗', label: 'Transport', bg: '#eff6ff', color: '#1e40af' },
    HEALTH: { emoji: '💊', label: 'Health', bg: '#f0fdf4', color: '#166534' },
    ENTERTAINMENT: { emoji: '🎮', label: 'Entertainment', bg: '#f5f3ff', color: '#5b21b6' },
    UTILITIES: { emoji: '⚡', label: 'Utilities', bg: '#fff1f2', color: '#9f1239' },
    OTHER: { emoji: '📦', label: 'Other', bg: '#f8fafc', color: '#475569' },
    SALARY: { emoji: '💰', label: 'Salary', bg: '#ecfdf5', color: '#065f46' },
    FREELANCE: { emoji: '💼', label: 'Freelance', bg: '#eff6ff', color: '#1e40af' },
    BUSINESS: { emoji: '🏢', label: 'Business', bg: '#f5f3ff', color: '#5b21b6' },
    INVESTMENT: { emoji: '📈', label: 'Investment', bg: '#f0fdf4', color: '#065f46' },
    GIFT: { emoji: '🎁', label: 'Gift', bg: '#fdf4ff', color: '#86198f' },
  };
  return map[category] ?? map.OTHER;
};

// Budget health color based on percentage spent
export const getBudgetColor = (percent) => {
  if (percent >= 100) return { bg: '#fff1f2', text: '#f43f5e', bar: '#f43f5e' };
  if (percent >= 75) return { bg: '#fffbeb', text: '#f59e0b', bar: '#f59e0b' };
  return { bg: '#ecfdf5', text: '#10b981', bar: '#10b981' };
};

// Check if JWT token is expired
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch (err) {
    return true;
  }
};

// Format date to ISO string (YYYY-MM-DD) for API
export const toISODate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// Get time of day for greeting
export const getTimeOfDay = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'morning';
  if (hours < 17) return 'afternoon';
  return 'evening';
};

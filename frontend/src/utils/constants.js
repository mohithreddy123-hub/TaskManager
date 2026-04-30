// Category metadata used across the app
export const CATEGORIES = [
  { value: 'food',          label: 'Food',          emoji: '🍔', colorClass: 'cat-food' },
  { value: 'travel',        label: 'Travel',        emoji: '✈️', colorClass: 'cat-travel' },
  { value: 'shopping',      label: 'Shopping',      emoji: '🛍️', colorClass: 'cat-shopping' },
  { value: 'bills',         label: 'Bills',         emoji: '💡', colorClass: 'cat-bills' },
  { value: 'study',         label: 'Study',         emoji: '📚', colorClass: 'cat-study' },
  { value: 'health',        label: 'Health',        emoji: '💊', colorClass: 'cat-health' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎮', colorClass: 'cat-entertainment' },
  { value: 'other',         label: 'Other',         emoji: '📌', colorClass: 'cat-other' },
];

export const getCategoryMeta = (value) =>
  CATEGORIES.find((c) => c.value === value) || CATEGORIES[CATEGORIES.length - 1];

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const todayISO = () => new Date().toISOString().split('T')[0];

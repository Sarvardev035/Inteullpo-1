import api from './axios';

export const statsApi = {
  expenses: async (period) => (await api.get('/statistics/expenses', { params: { period } })).data,
  income: async (period) => (await api.get('/statistics/income', { params: { period } })).data,
  breakdown: async () => (await api.get('/statistics/category-breakdown')).data,
  vsIncome: async (period) => (await api.get('/statistics/income-vs-expense', { params: { period } })).data,
};

// Legacy exports for backward compatibility
export const getExpenseStats = statsApi.expenses;
export const getIncomeStats = statsApi.income;
export const getCategoryBreakdown = statsApi.breakdown;
export const getIncomeVsExpense = statsApi.vsIncome;

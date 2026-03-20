import api from './axios';

export const statsApi = {
  expenses: (period) => api.get('/api/statistics/expenses', { params: { period } }),
  income: (period) => api.get('/api/statistics/income', { params: { period } }),
  breakdown: () => api.get('/api/statistics/category-breakdown'),
  vsIncome: () => api.get('/api/statistics/income-vs-expense'),
};

// Backward compatibility
export const getExpenseStats = async (period) => {
  const response = await statsApi.expenses(period);
  return response.data;
};

export const getIncomeStats = async (period) => {
  const response = await statsApi.income(period);
  return response.data;
};

export const getCategoryBreakdown = async () => {
  const response = await statsApi.breakdown();
  return response.data;
};

export const getIncomeVsExpense = async (period) => {
  const response = await statsApi.vsIncome();
  return response.data;
};

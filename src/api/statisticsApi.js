import api from './axios';

export const getExpenseStats = async (period) => (await api.get('/statistics/expenses', { params: { period } })).data;
export const getIncomeStats = async (period) => (await api.get('/statistics/income', { params: { period } })).data;
export const getCategoryBreakdown = async () => (await api.get('/statistics/category-breakdown')).data;
export const getIncomeVsExpense = async (period) => (await api.get('/statistics/income-vs-expense', { params: { period } })).data;

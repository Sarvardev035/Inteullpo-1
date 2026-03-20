import api from './axios';

export const getBudget = async () => (await api.get('/budget')).data;
export const setBudget = async (payload) => (await api.post('/budget', payload)).data;
export const getBudgetCategories = async () => (await api.get('/budget/categories')).data;
export const setBudgetCategory = async (payload) => (await api.post('/budget/categories', payload)).data;

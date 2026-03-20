import api from './axios';

export const budgetApi = {
  get: async () => (await api.get('/budget')).data,
  set: async (payload) => (await api.post('/budget', payload)).data,
  getCategories: async () => (await api.get('/budget/categories')).data,
  setCategory: async (payload) => (await api.post('/budget/categories', payload)).data,
};

// Legacy exports for backward compatibility
export const getBudget = budgetApi.get;
export const setBudget = budgetApi.set;
export const getBudgetCategories = budgetApi.getCategories;
export const setBudgetCategory = budgetApi.setCategory;

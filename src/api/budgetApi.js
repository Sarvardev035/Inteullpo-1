import api from './axios';

export const budgetApi = {
  get: () => api.get('/api/budget'),
  set: (data) => api.post('/api/budget', data),
  getCategories: () => api.get('/api/budget/categories'),
  setCategory: (data) => api.post('/api/budget/categories', data),
};

// Backward compatibility
export const getBudget = async () => {
  const response = await budgetApi.get();
  return response.data;
};

export const setBudget = async (payload) => {
  const response = await budgetApi.set(payload);
  return response.data;
};

export const getBudgetCategories = async () => {
  const response = await budgetApi.getCategories();
  return response.data;
};

export const setBudgetCategory = async (payload) => {
  const response = await budgetApi.setCategory(payload);
  return response.data;
};

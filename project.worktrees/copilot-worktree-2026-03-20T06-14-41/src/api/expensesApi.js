import api from './axios';

export const expensesApi = {
  getAll: async (params = {}) => (await api.get('/expenses', { params })).data,
  create: async (payload) => (await api.post('/expenses', payload)).data,
  update: async (id, payload) => (await api.put(`/expenses/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/expenses/${id}`)).data,
};

// Legacy exports for backward compatibility
export const getExpenses = expensesApi.getAll;
export const createExpense = expensesApi.create;
export const updateExpense = expensesApi.update;
export const removeExpense = expensesApi.delete;

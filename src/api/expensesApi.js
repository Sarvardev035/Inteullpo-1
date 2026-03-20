import api from './axios';

export const expensesApi = {
  getAll: (params) => api.get('/api/expenses', { params }),
  create: (data) => api.post('/api/expenses', data),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

// Backward compatibility
export const getExpenses = async (params = {}) => {
  const response = await expensesApi.getAll(params);
  return response.data;
};

export const createExpense = async (payload) => {
  const response = await expensesApi.create(payload);
  return response.data;
};

export const updateExpense = async (id, payload) => {
  const response = await expensesApi.update(id, payload);
  return response.data;
};

export const removeExpense = async (id) => {
  const response = await expensesApi.delete(id);
  return response.data;
};

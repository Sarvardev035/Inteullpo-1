import api from './axios';

export const debtsApi = {
  getAll: () => api.get('/api/debts'),
  create: (data) => api.post('/api/debts', data),
  update: (id, data) => api.put(`/api/debts/${id}`, data),
  delete: (id) => api.delete(`/api/debts/${id}`),
  close: (id) => api.put(`/api/debts/${id}`, { status: 'CLOSED' }),
};

// Backward compatibility
export const getDebts = async () => {
  const response = await debtsApi.getAll();
  return response.data;
};

export const createDebt = async (payload) => {
  const response = await debtsApi.create(payload);
  return response.data;
};

export const updateDebt = async (id, payload) => {
  const response = await debtsApi.update(id, payload);
  return response.data;
};

export const removeDebt = async (id) => {
  const response = await debtsApi.delete(id);
  return response.data;
};

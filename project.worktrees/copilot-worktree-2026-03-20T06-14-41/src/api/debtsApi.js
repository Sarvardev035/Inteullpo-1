import api from './axios';

export const debtsApi = {
  getAll: async () => (await api.get('/debts')).data,
  create: async (payload) => (await api.post('/debts', payload)).data,
  update: async (id, payload) => (await api.put(`/debts/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/debts/${id}`)).data,
  close: async (id) => (await api.put(`/debts/${id}`, { status: 'CLOSED' })).data,
};

// Legacy exports for backward compatibility
export const getDebts = debtsApi.getAll;
export const createDebt = debtsApi.create;
export const updateDebt = debtsApi.update;
export const removeDebt = debtsApi.delete;

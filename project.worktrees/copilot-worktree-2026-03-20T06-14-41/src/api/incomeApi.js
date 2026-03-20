import api from './axios';

export const incomeApi = {
  getAll: async (params = {}) => (await api.get('/income', { params })).data,
  create: async (payload) => (await api.post('/income', payload)).data,
  update: async (id, payload) => (await api.put(`/income/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/income/${id}`)).data,
};

// Legacy exports for backward compatibility
export const getIncome = incomeApi.getAll;
export const createIncome = incomeApi.create;
export const updateIncome = incomeApi.update;
export const removeIncome = incomeApi.delete;

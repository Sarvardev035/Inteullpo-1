import api from './axios';

export const accountsApi = {
  getAll: async () => (await api.get('/accounts')).data,
  create: async (payload) => (await api.post('/accounts', payload)).data,
  update: async (id, payload) => (await api.put(`/accounts/${id}`, payload)).data,
  delete: async (id) => (await api.delete(`/accounts/${id}`)).data,
};

// Legacy exports for backward compatibility
export const getAccounts = accountsApi.getAll;
export const createAccount = accountsApi.create;
export const updateAccount = accountsApi.update;
export const removeAccount = accountsApi.delete;

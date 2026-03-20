import api from './axios';

export const accountsApi = {
  getAll: () => api.get('/api/accounts'),
  create: (data) => api.post('/api/accounts', data),
  update: (id, data) => api.put(`/api/accounts/${id}`, data),
  delete: (id) => api.delete(`/api/accounts/${id}`),
};

// Backward compatibility
export const getAccounts = async () => {
  const response = await accountsApi.getAll();
  return response.data;
};

export const createAccount = async (payload) => {
  const response = await accountsApi.create(payload);
  return response.data;
};

export const updateAccount = async (id, payload) => {
  const response = await accountsApi.update(id, payload);
  return response.data;
};

export const removeAccount = async (id) => {
  const response = await accountsApi.delete(id);
  return response.data;
};

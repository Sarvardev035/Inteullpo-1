import api from './axios';

export const incomeApi = {
  getAll: (params) => api.get('/api/income', { params }),
  create: (data) => api.post('/api/income', data),
  update: (id, data) => api.put(`/api/income/${id}`, data),
  delete: (id) => api.delete(`/api/income/${id}`),
};

// Backward compatibility
export const getIncome = async (params = {}) => {
  const response = await incomeApi.getAll(params);
  return response.data;
};

export const createIncome = async (payload) => {
  const response = await incomeApi.create(payload);
  return response.data;
};

export const updateIncome = async (id, payload) => {
  const response = await incomeApi.update(id, payload);
  return response.data;
};

export const removeIncome = async (id) => {
  const response = await incomeApi.delete(id);
  return response.data;
};

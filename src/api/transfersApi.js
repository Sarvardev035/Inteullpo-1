import api from './axios';

export const transfersApi = {
  getAll: () => api.get('/api/transfers'),
  create: (data) => api.post('/api/transfers', data),
};

// Backward compatibility
export const getTransfers = async () => {
  const response = await transfersApi.getAll();
  return response.data;
};

export const createTransfer = async (payload) => {
  const response = await transfersApi.create(payload);
  return response.data;
};

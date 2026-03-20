import api from './axios';

export const transfersApi = {
  getAll: async () => (await api.get('/transfers')).data,
  create: async (payload) => (await api.post('/transfers', payload)).data,
};

// Legacy exports for backward compatibility
export const getTransfers = transfersApi.getAll;
export const createTransfer = transfersApi.create;

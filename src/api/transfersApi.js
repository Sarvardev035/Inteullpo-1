import api from './axios';

export const getTransfers = async () => (await api.get('/transfers')).data;
export const createTransfer = async (payload) => (await api.post('/transfers', payload)).data;

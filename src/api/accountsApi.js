import api from './axios';

export const getAccounts = async () => (await api.get('/accounts')).data;
export const createAccount = async (payload) => (await api.post('/accounts', payload)).data;
export const updateAccount = async (id, payload) => (await api.put(`/accounts/${id}`, payload)).data;
export const removeAccount = async (id) => (await api.delete(`/accounts/${id}`)).data;

import api from './axios';

export const getDebts = async () => (await api.get('/debts')).data;
export const createDebt = async (payload) => (await api.post('/debts', payload)).data;
export const updateDebt = async (id, payload) => (await api.put(`/debts/${id}`, payload)).data;
export const removeDebt = async (id) => (await api.delete(`/debts/${id}`)).data;

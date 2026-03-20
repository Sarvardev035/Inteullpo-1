import api from './axios';

export const getIncome = async (params = {}) => (await api.get('/income', { params })).data;
export const createIncome = async (payload) => (await api.post('/income', payload)).data;
export const updateIncome = async (id, payload) => (await api.put(`/income/${id}`, payload)).data;
export const removeIncome = async (id) => (await api.delete(`/income/${id}`)).data;

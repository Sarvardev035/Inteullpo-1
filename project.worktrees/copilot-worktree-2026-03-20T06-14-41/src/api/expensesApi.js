import api from './axios';

export const getExpenses = async (params = {}) => (await api.get('/expenses', { params })).data;
export const createExpense = async (payload) => (await api.post('/expenses', payload)).data;
export const updateExpense = async (id, payload) => (await api.put(`/expenses/${id}`, payload)).data;
export const removeExpense = async (id) => (await api.delete(`/expenses/${id}`)).data;

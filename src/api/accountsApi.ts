import api from './axios';

export interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export const getAccounts = async () => {
  const response = await api.get('/accounts');
  // Handle backend wrapper structure { data: { content: [...] } } or { data: [...] } if applicable
  return response.data;
};

export const createAccount = async (data: Partial<Account>) => {
  const response = await api.post('/accounts', data);
  return response.data;
};

export const editAccount = async (id: string, data: Partial<Account>) => {
  const response = await api.put(`/accounts/${id}`, data);
  return response.data;
};

export const deleteAccount = async (id: string) => {
  const response = await api.delete(`/accounts/${id}`);
  return response.data;
};

import api from './axios';

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  currency: string;
  dueDate: string;
  type: 'LENT' | 'BORROWED';
  description: string;
  status: 'OPEN' | 'CLOSED';
}

export const getDebts = async () => {
  const response = await api.get('/debts');
  return response.data;
};

export const createDebt = async (data: Partial<Debt>) => {
  const response = await api.post('/debts', data);
  return response.data;
};

export const updateDebt = async (id: string, data: Partial<Debt>) => {
  const response = await api.put(`/debts/${id}`, data);
  return response.data;
};

export const deleteDebt = async (id: string) => {
  const response = await api.delete(`/debts/${id}`);
  return response.data;
};

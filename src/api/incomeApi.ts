import api from './axios';

export interface Income {
  id: string;
  amount: number;
  description: string;
  category: string;
  source: string;
  accountId: string;
  date: string; // YYYY-MM-DD
}

export const getIncomes = async () => {
  const response = await api.get('/income');
  return response.data;
};

export const createIncome = async (data: Partial<Income>) => {
  const response = await api.post('/income', data);
  return response.data;
};

export const editIncome = async (id: string, data: Partial<Income>) => {
  const response = await api.put(`/income/${id}`, data);
  return response.data;
};

export const deleteIncome = async (id: string) => {
  const response = await api.delete(`/income/${id}`);
  return response.data;
};

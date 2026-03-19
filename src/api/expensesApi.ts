import api from './axios';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  accountId: string;
  date: string; // YYYY-MM-DD
}

export const getExpenses = async (month?: number, year?: number) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  
  const response = await api.get(`/expenses?${params.toString()}`);
  return response.data;
};

export const createExpense = async (data: Partial<Expense>) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const editExpense = async (id: string, data: Partial<Expense>) => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

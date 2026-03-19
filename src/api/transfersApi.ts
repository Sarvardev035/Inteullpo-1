import api from './axios';

export interface Transfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
}

export const getTransfers = async () => {
  const response = await api.get('/transfers');
  return response.data;
};

export const createTransfer = async (data: Partial<Transfer>) => {
  const response = await api.post('/transfers', data);
  return response.data;
};

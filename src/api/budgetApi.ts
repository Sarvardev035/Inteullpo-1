import api from './axios';

export interface BudgetCategory {
  categoryId?: string;
  limit: number;
}

export const getBudget = async () => {
  const response = await api.get('/budget');
  return response.data;
};

export const setIncomeTarget = async (data: { target: number }) => {
  const response = await api.post('/budget', data);
  return response.data;
};

export const getCategoryLimits = async () => {
  const response = await api.get('/budget/categories');
  return response.data;
};

export const setCategoryLimit = async (data: BudgetCategory) => {
  const response = await api.post('/budget/categories', data);
  return response.data;
};

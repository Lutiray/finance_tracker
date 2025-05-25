import api from './AxiosConfig';

export const getSummary = async () => {
  const response = await api.get('/transactions/summary');
  return response.data;
};

export const getRecentTransactions = async (params = {}) => {
  const response = await api.get('/transactions/recent', { params });
  return response.data;
};
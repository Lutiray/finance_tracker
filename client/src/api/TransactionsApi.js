import api from './AxiosConfig';

export const getSummary = async () => {
  const response = await api.get('/transaction/summary');
  return response.data;
};

export const getRecentTransactions = async (params = {}) => {
  const response = await api.get('/transaction', { params });
  return response.data;
};

// Добавляем новый метод для получения данных графика
export const getBalanceHistory = async (period = 'month') => {
  const response = await api.get('/transaction/balance-history', {
    params: { period }
  });
  return response.data;
};
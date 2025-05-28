import api from './AxiosConfig';

export const getAccounts = async () => {
  const response = await api.get('/account');
  return response.data;
};
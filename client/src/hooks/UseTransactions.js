import { useState, useEffect } from 'react';
import {
  getSummary,
  getRecentTransactions,
  getBalanceHistory
} from '@/api/TransactionsApi';

export const useTransactions = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const [summary, recent, history] = await Promise.all([
          getSummary(),
          getRecentTransactions({ limit: 5 }),
          getBalanceHistory('month'),
        ]);

        setData({
          ...summary,
          recentTransactions: recent,
          balanceHistory: formatChartData(history),
        });
      } catch (err) {
        setError(err?.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Форматируем данные для Chart.js
  const formatChartData = (history) => {
    if (!history) return null;

    return {
      labels: history.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Account Balance',
          data: history.map(item => item.balance),
          borderColor: '#BA76C2',
          backgroundColor: 'rgba(186, 118, 194, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  return { data, isLoading, error };
};
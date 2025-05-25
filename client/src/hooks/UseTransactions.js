import { useEffect, useState } from 'react';
import { getSummary, getRecentTransactions } from '@/api/transactionsApi';

export const useTransactions = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summary, transactions] = await Promise.all([
          getSummary(),
          getRecentTransactions({ limit: 5 })
        ]);

        setData({
          balance: summary.totalBalance,
          income: summary.monthlyIncome,
          expenses: summary.monthlyExpenses,
          trend: summary.balanceTrend,
          recentTransactions: transactions
        });
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};
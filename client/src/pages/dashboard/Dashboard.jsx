import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import BalanceCard from '@/components/dashboard/BalanceCard';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import Loader from '@/components/ui/Loader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import styles from './Dashboard.module.scss';

const Dashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useTransactions();

  if (isLoading) return <Loader fullscreen />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p>Here's your financial overview</p>
      </header>

      <div className={styles.grid}>
        <BalanceCard 
          title="Total Balance"
          value={data?.balance || 0}
          trend={data?.trend || 0}
          currency="USD"
          className={styles.balanceCard}
        />

        <BalanceCard 
          title="Monthly Income" 
          value={data?.income || 0}
          trend={12.5}
          icon="↑"
          className={styles.incomeCard}
        />

        <BalanceCard 
          title="Monthly Expenses"
          value={data?.expenses || 0}
          trend={-8.3}
          icon="↓"
          className={styles.expenseCard}
        />

        <RecentTransactions 
          transactions={data?.recentTransactions || []}
          className={styles.transactions}
        />
      </div>
    </div>
  );
};

export default Dashboard;
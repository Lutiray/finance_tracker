import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/UseAccount';
import BalanceCard from '@/components/dashboard/balanceCard/BalanceCard';
import RecentTransactions from '@/components/dashboard/recentTransactions/RecentTransactions';
import Loader from '@/components/ui/loader/Loader';
import BalanceChart from '@/components/dashboard/charts/barChart/BalanceChart';
import PieChart from '@/components/dashboard/charts/pieChart/PieChart'
import ErrorMessage from '@/components/ui/errorMessages/ErrorMessage';
import Tabs from '@/components/ui/tabs/Tabs';
import Header from '@/components/layout/header/Header';
import Sidebar from '@/components/layout/sidebar/Sidebar'
import styles from './Dashboard.module.scss';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('monthly');
  const [chartView, setChartView] = useState('bar');
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError
  } = useTransactions();

  const {
    data: accountsData,
    isLoading: accountsLoading,
    error: accountsError
  } = useAccounts();

  const mainCurrency = accountsData?.[0]?.currency || 'CZK';

  if (transactionsLoading || accountsLoading) return <Loader fullscreen />;
  if (transactionsError || accountsError) {
    return <ErrorMessage error={transactionsError || accountsError} />;
  }

  const chartTabs = [
    { id: 'bar', label: 'Monthly Trends' },
    { id: 'pie', label: 'By Categories' }
  ];

  const transactionTabs = [
    { id: 'day', label: 'Today' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Transactions' }
  ];

  return (
    <div className={styles.dashboard}>
      <Header
        user={user}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <Sidebar
        user={user}
        accounts={accountsData}
        activeNavItem={activeNavItem}
        onNavItemClick={setActiveNavItem}
        mobileOpen={mobileMenuOpen}
      />

      <main className={styles.content}>
        <section className={styles.overview}>
          <BalanceCard
            title="Total Balance"
            value={transactionsData?.balance || 0}
            trend={transactionsData?.trend || 0}
            currency={mainCurrency}
            large
          />
        </section>

        <section className={styles.chartSection}>
          <div className={styles.chartHeader}>
            <h3>Spending Analytics</h3>
            <Tabs
              tabs={chartTabs}
              activeTab={chartView}
              onChange={setChartView}
              small
            />
          </div>

          {chartView === 'bar' ? (
            <BalanceChart data={transactionsData?.balanceHistory} />
          ) : (
            <PieChart data={transactionsData?.categorySpending} />
          )}
        </section>

        <section className={styles.transactionsSection}>
          <div className={styles.sectionHeader}>
            <h3>Transactions</h3>
            <Tabs
              tabs={transactionTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              small
            />
          </div>
          <RecentTransactions
            transactions={transactionsData?.recentTransactions || []}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
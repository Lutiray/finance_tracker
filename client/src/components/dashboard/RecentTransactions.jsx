import { Link } from 'react-router-dom';
import styles from './RecentTransactions.module.scss';

const RecentTransactions = ({ transactions, className }) => {
  if (!transactions?.length) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p>No transactions yet</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3>Recent Transactions</h3>
        <Link to="/transactions" className={styles.viewAll}>
          View All
        </Link>
      </div>

      <ul className={styles.list}>
        {transactions.map((transaction) => (
          <li key={transaction.id} className={styles.item}>
            <div className={styles.info}>
              <span className={styles.category}>{transaction.category}</span>
              <span className={styles.date}>{transaction.date}</span>
            </div>
            <div className={`${styles.amount} ${transaction.type === 'income' ? styles.income : styles.expense}`}>
              {transaction.type === 'income' ? '+' : '-'}
              {transaction.amount}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTransactions;
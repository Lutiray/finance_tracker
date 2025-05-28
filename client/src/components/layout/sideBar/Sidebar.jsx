import styles from './Sidebar.module.scss';

const Sidebar = ({ user, accounts, activeNavItem, onNavItemClick }) => {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'transactions', icon: '💸', label: 'Transactions' },
    { id: 'categories', icon: '🗂️', label: 'Categories' },
    { id: 'accounts', icon: '🏦', label: 'Accounts' },
    { id: 'planned', icon: '📅', label: 'Planned Spending' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profileSection}>
        <div className={styles.profilePic}>{user?.name?.charAt(0) || '👤'}</div>
        <div className={styles.profileName}>{user?.name || 'User'}</div>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeNavItem === item.id ? styles.active : ''}`}
            onClick={() => onNavItemClick(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.accountsSection}>
        <h4 className={styles.sectionTitle}>Your Accounts</h4>
        {accounts?.map(account => (
          <div key={account._id} className={styles.accountCard}>
            <div className={styles.accountIcon}>
              {account.currency === 'USD' ? '$' : 
               account.currency === 'EUR' ? '€' : 
               account.currency === 'CZK' ? 'Kč' : '₽'}
            </div>
            <div className={styles.accountInfo}>
              <h5>{account.name}</h5>
              <p>{account.balance.toFixed(2)} {account.currency}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
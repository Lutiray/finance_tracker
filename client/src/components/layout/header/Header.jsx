import logo from '@/assets/logo.svg';
import styles from './Header.module.scss';

const Header = ({ user }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoSection}>
        <img src={logo} alt="Finance App Logo" className={styles.logo} />
        <span className={styles.appName}>FINSENSE</span>
      </div>
      
      <div className={styles.userInfo}>
        {user && (
          <>
            <div className={styles.userName}>{user.name}'s Wallet</div>
            <div className={styles.userEmail}>{user.email}</div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
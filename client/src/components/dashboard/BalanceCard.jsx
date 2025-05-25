import styles from './BalanceCard.module.scss';

const BalanceCard = ({ 
  title, 
  value, 
  currency = 'USD', 
  trend = 0, 
  icon = '',
  className = '' 
}) => {
  const isPositive = trend >= 0;
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);

  return (
    <div className={`${styles.card} ${className}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.value}>{formattedValue}</div>
      
      {(trend !== 0 || icon) && (
        <div className={`${styles.trend} ${isPositive ? styles.positive : styles.negative}`}>
          {icon} {trend !== 0 && `${Math.abs(trend)}%`}
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
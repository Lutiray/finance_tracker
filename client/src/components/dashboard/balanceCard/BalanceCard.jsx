import styles from './BalanceCard.module.scss';

const BalanceCard = ({ title, value, trend = 0, currency = 'CZK', large = false }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-EN', {
      style: 'currency',
      currency: currency || 'CZK',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const trendColor = trend > 0 ? styles.positive : (trend < 0 ? styles.negative : styles.neutral);
  const trendIcon = trend > 0 ? '↑' : (trend < 0 ? '↓' : '');

  return (
    <div className={`${styles.card} ${large ? styles.large : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.value}>{formatAmount(value)}</div>
      {trend !== 0 && (
        <div className={`${styles.trend} ${trendColor}`}>
          {trendIcon} {Math.abs(trend).toFixed(2)}% {trend > 0 ? 'increase' : 'decrease'}
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
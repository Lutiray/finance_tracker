import styles from './Loader.module.scss';

const Loader = ({ size = 24, color = '#BA76C2' }) => (
  <div className={styles.container} style={{ '--size': `${size}px`, '--color': color }}>
    <div className={styles.spinner}></div>
  </div>
);

export default Loader;
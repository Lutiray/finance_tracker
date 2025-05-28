import styles from './Tabs.module.scss';

const Tabs = ({ tabs, activeTab, onChange, small = false }) => {
  return (
    <div className={`${styles.tabs} ${small ? styles.small : ''}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './PieChart.module.scss';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const PieChart = ({ data }) => {
  if (!data || !data.labels || !data.datasets) {
    return <div className={styles.loading}>Loading chart data...</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Мы сделаем кастомную легенду
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Создаём кастомную легенду
  const legendItems = data.labels.map((label, index) => ({
    label,
    color: data.datasets[0].backgroundColor[index]
  }));

  return (
    <div className={styles.container}>
      <h3>Spending by Categories</h3>
      <div className={styles.chartWrapper}>
        <Pie data={data} options={options} />
      </div>
      <div className={styles.legend}>
        {legendItems.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: item.color }} 
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
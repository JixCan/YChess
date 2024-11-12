import { ChartData, ChartOptions } from 'chart.js';

export interface MatchStats {
  wins: number;
  draws: number;
  losses: number;
}

export const createDonutChartConfig = (
  data: MatchStats,
  width: number = 400,
  height: number = 400
) => {
  const chartData: ChartData<'doughnut'> = {
    labels: ['Победы', 'Ничьи', 'Поражения'],
    datasets: [
      {
        data: [data.wins, data.draws, data.losses],
        backgroundColor: ['#4CAF50', '#BDBDBD', '#F44336'],
        hoverBackgroundColor: ['#66BB6A', '#E0E0E0', '#E57373'],
      },
    ],
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false, // Отключаем поддержание соотношения сторон для кастомных размеров
    cutout: '70%',
    animation: {
      animateRotate: true,
      animateScale: true, // Включаем увеличение, для более плавной анимации
      duration: 1000,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: 'var(--main-text-color)', // Используем переменную CSS для цвета текста
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return { data: chartData, options: chartOptions, width, height };
};

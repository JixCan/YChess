import { ChartData, ChartOptions } from 'chart.js';

export interface ModeStats {
  wins: number;
  draws: number;
  losses: number;
}

export interface RatingStats {
  bullet: number;
  blitz: number;
  rapid: number;
}

export interface PuzzleStats {
  games: number;
  rating: number;
}

// Обновляем функцию для создания донат-графика
export const createWDLDonutConfig = (
  data: ModeStats,
  width: number = 400,
  height: number = 400,
  username: string,
  platform: string,
  elementsTextColor: string // Добавляем параметр для цвета текста
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
    maintainAspectRatio: false,
    cutout: '70%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: elementsTextColor, // Используем переданный цвет
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
      title: {
        display: true,
        text: `${username} (${platform})`, // Подпись с именем пользователя и платформой
        color: elementsTextColor, // Используем переданный цвет для текста заголовка
      },
    },
  };

  return { data: chartData, options: chartOptions, width, height };
};

// Обновляем функцию для создания столбчатого графика
export const createWLDBarChartConfig = (
  data: ModeStats,
  username: string,
  platform: string,
  elementsTextColor: string // Добавляем параметр для цвета текста
) => {
  const chartData: ChartData<'bar'> = {
    labels: ['Победы', 'Ничьи', 'Поражения'],
    datasets: [
      {
        label: 'Количество игр',
        data: [data.wins, data.draws, data.losses],
        backgroundColor: ['#4CAF50', '#BDBDBD', '#F44336'],
        borderColor: ['#388E3C', '#757575', '#D32F2F'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Количество игр',
          color: elementsTextColor, // Используем переданный цвет для оси X
        },
        ticks: {
          color: elementsTextColor, // Цвет числовых значений на оси X
        },
      },
      y: {
        title: {
          display: true,
          text: 'Результаты',
          color: elementsTextColor, // Используем переданный цвет для оси Y
        },
        ticks: {
          color: elementsTextColor, // Цвет числовых значений на оси X
        },
      },
    },
    plugins: {
      legend: {
        display: false,
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
      title: {
        display: true,
        text: `${username} (${platform})`, // Подпись с именем пользователя и платформой
        color: elementsTextColor, // Используем переданный цвет для текста заголовка
      },
    },
  };

  return { data: chartData, options: chartOptions };
};

export const createRatingsBarChartConfig = (
  data: RatingStats,
  username: string,
  platform: string,
  elementsTextColor: string // Добавляем параметр для цвета текста
) => {
  const chartData: ChartData<'bar'> = {
    labels: ['Пуля', 'Блиц', 'Рапид'],
    datasets: [
      {
        label: 'Рейтинг',
        data: [data.bullet, data.blitz, data.rapid],
        backgroundColor: ["#4CAF50", "#4CAF50", "#4CAF50"],
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Количество игр',
          color: elementsTextColor, // Используем переданный цвет для оси X
        },
        ticks: {
          color: elementsTextColor, // Цвет числовых значений на оси X
        },
      },
      y: {
        title: {
          display: true,
          text: 'Результаты',
          color: elementsTextColor, // Используем переданный цвет для оси Y
        },
        ticks: {
          color: elementsTextColor, // Цвет числовых значений на оси X
        },
      },
    },
    plugins: {
      legend: {
        display: false,
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
      title: {
        display: true,
        text: `${username} (${platform})`, // Подпись с именем пользователя и платформой
        color: elementsTextColor, // Используем переданный цвет для текста заголовка
      },
    },
  };

  return { data: chartData, options: chartOptions };
};
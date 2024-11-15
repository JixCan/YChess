import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { createWDLDonutConfig, createWLDBarChartConfig, ModeStats } from '../utils/chartutils';
import '../styles/Stats.css';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Stats: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [gameMode, setGameMode] = useState<string>('chess_bullet'); // default mode
  const [platform, setPlatform] = useState<'Chess.com' | 'Lichess.org'>('Chess.com'); // default platform
  const [chartData, setChartData] = useState<{ data: any; options: any } | null>(null);
  const [barChartData, setBarChartData] = useState<{ data: any; options: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const elementsTextColor = window.getComputedStyle(document.documentElement).getPropertyValue('--elements-text-color').trim();

  const handleFetchStats = async () => {
    try {
      let response;
      if (platform === 'Chess.com') {
        response = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
      } else {
        response = await fetch(`https://lichess.org/api/user/${username}/perf/${gameMode.replace('chess_', '')}`);
      }

      if (!response.ok) {
        setError('Пользователь не найден или произошла ошибка');
        setChartData(null);
        setBarChartData(null);
        return;
      }

      const data = await response.json();

      // Обработка данных в зависимости от платформы
      let stats: ModeStats;
      if (platform === 'Chess.com') {
        const modeData = data[gameMode];
        if (!modeData || !modeData.record) {
          setError('Статистика по выбранному режиму недоступна');
          setChartData(null);
          setBarChartData(null);
          return;
        }
        stats = {
          wins: modeData.record.win,
          draws: modeData.record.draw,
          losses: modeData.record.loss,
        };
      } else {
        const modeData = data.stat.count;
        stats = {
          wins: modeData.win,
          draws: modeData.draw,
          losses: modeData.loss,
        };
      }
      console.log(elementsTextColor);
      setChartData(createWDLDonutConfig(stats, 300, 300, username, platform, elementsTextColor));
      setBarChartData(createWLDBarChartConfig(stats, username, platform, elementsTextColor));

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Произошла ошибка при получении данных');
      setChartData(null);
      setBarChartData(null);
    }
  };

  return (
    <div>
      <h1>Статистика сторонних аккаунтов</h1>

      {/* Выбор платформы */}
      <div>
        <input
          type="radio"
          id="Chess.com"
          name="platform"
          value="Chess.com"
          checked={platform === 'Chess.com'}
          onChange={() => setPlatform('Chess.com')}
        />
        <label htmlFor="Chess.com">Chess.com</label>

        <input
          type="radio"
          id="Lichess.org"
          name="platform"
          value="Lichess.org"
          checked={platform === 'Lichess.org'}
          onChange={() => setPlatform('Lichess.org')}
        />
        <label htmlFor="Lichess.org">Lichess.org</label>
      </div>

      {/* Input для ника пользователя */}
      <input
        type="text"
        placeholder="Введите ник"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Select для выбора режима игры */}
      <select value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
        <option value="chess_bullet">Пуля</option>
        <option value="chess_blitz">Блиц</option>
        <option value="chess_rapid">Рапид</option>
      </select>

      {/* Кнопка для запроса данных */}
      <button onClick={handleFetchStats}>Получить статистику</button>

      {/* Обработка ошибок */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="wdl-charts">
        <h3>Победы, ничьи и поражения</h3>
        {/* Контейнер для графиков, расположенных по горизонтали */}
        <div className="wdl-charts-container">
          {/* Контейнер для графика с фиксированной шириной и высотой */}
          {chartData && (
            <div className="wdl-chart-container">
              <Doughnut data={chartData.data} options={chartData.options} />
            </div>
          )}

          {/* Контейнер для вертикальной столбчатой диаграммы */}
          {barChartData && (
            <div className="wdl-chart-container">
              <Bar data={barChartData.data} options={barChartData.options} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;

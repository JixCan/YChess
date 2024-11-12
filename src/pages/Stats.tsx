import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { createDonutChartConfig, MatchStats } from '../utils/chartutils';
import '../styles/Stats.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Stats: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [gameMode, setGameMode] = useState<string>('chess_bullet'); // default mode
  const [chartData, setChartData] = useState<{ data: any; options: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchStats = async () => {
    try {
      const response = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
      if (!response.ok) {
        setError('Пользователь не найден или произошла ошибка');
        setChartData(null);
        return;
      }
      const data = await response.json();

      const modeData = data[gameMode];
      if (!modeData || !modeData.record) {
        setError('Статистика по выбранному режиму недоступна');
        setChartData(null);
        return;
      }

      const stats: MatchStats = {
        wins: modeData.record.win,
        draws: modeData.record.draw,
        losses: modeData.record.loss,
      };

      setChartData(createDonutChartConfig(stats, 300, 300));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Произошла ошибка при получении данных');
      setChartData(null);
    }
  };

  return (
    <div>
      <h2>Здесь можно получить подробную статистику по аккаунтам</h2>
      
      {/* Input для ника пользователя */}
      <input
        type="text"
        placeholder="Введите ник на Chess.com"
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

      {/* Контейнер для графика с фиксированной шириной и высотой */}
      {chartData && (
        <div className="chart-container">
          <Doughnut data={chartData.data} options={chartData.options} />
        </div>
      )}
    </div>
  );
};

export default Stats;

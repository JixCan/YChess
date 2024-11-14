import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RatingData {
  rating: number;
  timestamp: string;
}

interface RatingChartsProps {
  onUpdateRating: (newRating: number) => void;  // Добавляем onUpdateRating как пропс
}

const RatingCharts: React.FC<RatingChartsProps> = ({ onUpdateRating }) => {
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      fetchUserRatings(user.id);
    }
  }, []);

  const fetchUserRatings = async (userId: number) => {
    try {
      const response = await axios.get<RatingData[]>(`http://localhost:5000/api/user-ratings/${userId}`);
      setRatings(response.data);
      setError(null);

      // Обновляем рейтинг, передавая последний элемент массива данных в onUpdateRating
      if (response.data.length > 0) {
        const latestRating = response.data[response.data.length - 1].rating;
        onUpdateRating(latestRating);
      }
    } catch (err) {
      setError('Ошибка при загрузке данных рейтинга');
      console.error(err);
    }
  };

  // Преобразование данных для графика
  const chartData = {
    labels: ratings.map((data) => new Date(data.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Rating',
        data: ratings.map((data) => data.rating),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h2>User Rating History</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {ratings.length > 0 ? (
        <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
      ) : (
        <p>No rating data available.</p>
      )}
    </div>
  );
};

export default RatingCharts;

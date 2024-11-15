import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import '../styles/RatingCharts.css'
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
  scales,
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

  const elementsTextColor = window.getComputedStyle(document.documentElement).getPropertyValue('--elements-text-color').trim();

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
        label: 'Рейтинг',
        data: ratings.map((data) => data.rating),
        borderColor: elementsTextColor,
        backgroundColor: elementsTextColor,
        fill: false,
      },
    ],
  };

  return (
    <div className='rating-chart-container'>
      <h2>История изменения вашего рейтинга:</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {ratings.length > 0 ? (
       <Line
       data={chartData}
       options={{
         responsive: true,
         plugins: {
           legend: {
             display: true,
             labels: {
               color: elementsTextColor, // Окрашиваем текст легенды
             },
           },
         },
         scales: {
           x: {
             ticks: {
               color: elementsTextColor, // Цвет текста меток
               maxTicksLimit: 5, // Ограничиваем количество меток
               
             },
           },
           y: {
             ticks: {
               color: elementsTextColor, // Цвет текста вдоль оси Y
             },
           },
         },
       }}
     />
     

      ) : (
        <p>Информации нет или она недоступна.</p>
      )}
    </div>
  );
};

export default RatingCharts;

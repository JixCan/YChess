import React from 'react';
import '../styles/Home.css'; // Подключаем стили

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Добро пожаловать в YChess!</h1>
      <p>YChess — это платформа для повышения шахматной квалификации. Решайте задачи, отслеживайте свой рейтинг и анализируйте игры.</p>
    </div>
  );
};

export default Home;

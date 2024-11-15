import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RatingCharts from './RatingCharts';
import '../styles/Cabinet.css'
import AppButton from './AppButton';

interface User {
  id: number;
  username: string;
  rating: number;
}

const Cabinet: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleRegister = async () => {
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/register', { username, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
    } catch (err) {
      setError('Пользователь с таким никнеймом уже существует!');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
    } catch (err) {
      setError('Неверный никнейм или пароль!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Функция обновления рейтинга пользователя
  const updateUserRating = (newRating: number) => {
    if (user) {
      setUser({ ...user, rating: newRating });
    }
  };

  if (user) {
    return (
      <div className='info-container'>
        <div className="info-panel">
          <h2>Добро пожаловать, {user.username}!</h2>
          <p>Ваш рейтинг: {user.rating}</p>
          <AppButton className='cab-button' onClick={handleLogout}>Выйти</AppButton>
        </div>
        <RatingCharts onUpdateRating={updateUserRating} />
      </div>
    );
  }

  return (
    <div className='login-container'>
      <h2>Чтобы сохранять статистику изменения вашего рейтинга, зарегистрируйтесь или войдите в свой аккаунт.</h2>
      <div className="login-panel">
        <div className="inputs-container">
          <input
            type="text"
            placeholder="Никнейм"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="login-buttons-container">
        <AppButton className='cab-button' onClick={handleLogin}>Войти</AppButton>
        <AppButton className='cab-button' onClick={handleRegister}>Зарегистрироваться</AppButton>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Cabinet;

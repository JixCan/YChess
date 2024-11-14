import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RatingCharts from './RatingCharts';

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
    try {
      const response = await axios.post('http://localhost:5000/api/register', { username, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
    } catch (err) {
      setError('Username already exists');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setError(null);
    } catch (err) {
      setError('Invalid username or password');
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
      <div>
        <h2>Welcome, {user.username}!</h2>
        <p>Rating: {user.rating}</p>
        <button onClick={handleLogout}>Logout</button>
        {/* Передаем updateUserRating в RatingCharts */}
        <RatingCharts  onUpdateRating={updateUserRating} />
      </div>
    );
  }

  return (
    <div>
      <h2>Register or Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Cabinet;

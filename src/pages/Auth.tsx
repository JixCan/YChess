// Auth.tsx
import React, { useState } from 'react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    const endpoint = isLogin ? 'http://localhost:5000/login' : 'http://localhost:5000/register';  // Обновляем URL
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Для передачи сессии
    });

    if (response.ok) {
      window.location.href = '/cabinet';
    } else {
      alert('Ошибка при аутентификации');
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
      <input
        type="email"
        placeholder="Почта"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
};

export default Auth;

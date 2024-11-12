// TopMenu.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TopMenu.css';
import ThemeToggle from './ThemeToggle';

const TopMenu: React.FC = () => {
  return (
    <nav className="top-menu">
      <div className="logo">YChess</div>
      <div className="center-content">
        <ul className="menu-links">
          <li>
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/puzzles">Шахматные задачи</Link>
          </li>
          <li>
            <Link to="/stats">Статистика аккаунтов</Link>
          </li>
          <li>
            <Link to="/cabinet">Личный кабинет</Link>
          </li>
          <li>
            <Link to="/pgn">Анализ партии</Link>
          </li>
          <li>
            <Link to="/auth">Войти</Link>
          </li>
        </ul>
        <ThemeToggle /> {/* Переключатель темы */}
      </div>
    </nav>
  );
};

export default TopMenu;

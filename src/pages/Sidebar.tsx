import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

// Импортируем SVG иконки
import { ReactComponent as HomeIcon } from '../icons/home.svg';
import { ReactComponent as PuzzleIcon } from '../icons/puzzle.svg';
import { ReactComponent as StatsIcon } from '../icons/stats.svg';
import { ReactComponent as TrackingIcon } from '../icons/key.svg';
import { ReactComponent as PgnIcon } from '../icons/eye.svg';

const Sidebar: React.FC = () => {

  return (
    <nav className="sidebar">
      <div className="logo">YChess</div>
      <ul>
        <li>
          <Link to="/">
            <HomeIcon className="sidebar-icon" />
            Главная
          </Link>
        </li>
        <li>
          <Link to="/puzzles">
            <PuzzleIcon className="sidebar-icon" />
            Шахматные задачи
          </Link>
        </li>
        <li>
          <Link to="/stats">
            <StatsIcon className="sidebar-icon" />
            Статистика аккаунтов
          </Link>
        </li>
        <li>
          <Link to="/cabinet">
            <TrackingIcon className="sidebar-icon" />
            Личный кабинет
          </Link>
        </li>
        <li>
          <Link to="/pgn">
            <PgnIcon className="sidebar-icon" />
            Анализ партии
          </Link>
        </li>
        <li>
          <Link to="/auth">
            Войти
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;

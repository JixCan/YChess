import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <nav className="sidebar">
      <div className="logo">YChess</div>
      <ul>
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/puzzles">Шахматные задачи</Link></li>
        <li><Link to="/profile">Личный кабинет</Link></li>
        <li><Link to="/tracking">Отслеживание рейтинга</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;

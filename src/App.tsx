// App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Puzzles from './pages/Puzzles';
import Stats from './pages/Stats';
import Cabinet from './pages/Cabinet';
import PGNViewer from './pages/PGNViewer';
import Auth from './pages/Auth';
import './styles/App.css';
import TopMenu from './pages/TopMenu';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <TopMenu />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/puzzles" element={<Puzzles />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/pgn" element={<PGNViewer />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

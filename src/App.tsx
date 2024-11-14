// App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Puzzles from './pages/Puzzles';
import Stats from './pages/Stats';
import PGNViewer from './pages/PGNViewer';
import './styles/App.css';
import TopMenu from './pages/TopMenu';
import Cabinet from './pages/Cabinet';

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
            <Route path="/pgn" element={<PGNViewer />} />
            <Route path="/cabinet" element={<Cabinet />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

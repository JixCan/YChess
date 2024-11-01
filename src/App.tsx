import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Puzzles from './pages/Puzzles';
import Profile from './components/Profile';
import Tracking from './pages/Tracking';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/puzzles" element={<Puzzles />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tracking" element={<Tracking />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

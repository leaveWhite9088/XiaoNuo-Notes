import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import FavoritePage from './pages/FavoritePage';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video/:bvid" element={<VideoPage />} />
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/anime" element={<HomePage />} />
          <Route path="/bangumi" element={<HomePage />} />
          <Route path="/music" element={<HomePage />} />
          <Route path="/dance" element={<HomePage />} />
          <Route path="/game" element={<HomePage />} />
          <Route path="/tech" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

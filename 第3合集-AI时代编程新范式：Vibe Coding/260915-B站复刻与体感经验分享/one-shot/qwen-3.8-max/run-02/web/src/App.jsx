import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Detail from './pages/Detail.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:id" element={<Detail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <p>哔哩哔哩 (゜-゜)つロ 干杯~ · 本项目为教学用途的首页复刻 Demo</p>
          <p className="footer-sub">前端 React + Vite (3131) · 后端 Express (5131) · 数据层独立分层</p>
        </div>
      </footer>
    </div>
  );
}

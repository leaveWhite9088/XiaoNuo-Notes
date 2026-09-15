import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import VideoPage from './pages/VideoPage.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video/:bvid" element={<VideoPage />} />
      </Routes>
    </div>
  );
}

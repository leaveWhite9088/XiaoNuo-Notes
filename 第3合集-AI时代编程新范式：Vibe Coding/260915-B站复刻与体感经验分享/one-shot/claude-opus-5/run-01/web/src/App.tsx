import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ScrollToTopOnNavigate } from './components/layout/ScrollToTopOnNavigate';

export function App() {
  return (
    <>
      <ScrollToTopOnNavigate />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:bvid" element={<VideoPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

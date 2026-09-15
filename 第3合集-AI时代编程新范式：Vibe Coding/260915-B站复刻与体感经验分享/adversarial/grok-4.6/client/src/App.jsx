import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import VideoPage from './pages/VideoPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/channel/:id" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

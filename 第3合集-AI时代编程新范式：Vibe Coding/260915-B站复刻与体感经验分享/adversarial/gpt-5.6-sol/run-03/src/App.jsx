import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import VideoPage from './pages/VideoPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/video/:id" element={<VideoPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

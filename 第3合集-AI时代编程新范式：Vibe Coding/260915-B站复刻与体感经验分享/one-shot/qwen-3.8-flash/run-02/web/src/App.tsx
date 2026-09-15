import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import VideoDetail from "./pages/VideoDetail";

export default function App() {
  return (
    <div className="app">
      <Header onSearch={() => {}} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bili-footer">
        B 站首页复刻 · 前端 3141 / 后端 5141 · 数据来自 B 站公开接口真实种子
      </footer>
    </div>
  );
}

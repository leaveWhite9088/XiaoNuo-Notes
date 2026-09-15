import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav';
import Toast from './components/Toast';
import Detail from './pages/Detail';
import Home from './pages/Home';
import Search from './pages/Search';

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <div className="page-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video/:id" element={<Detail />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <footer className="footer">
        B 站首页复刻 V0 · 前端 3142 / 后端 5142 · 封面/头像/标题/UP 主/播放数据来自 B 站公开接口真实快照 ·
        演示播放流为开放示例视频 · 仅供技术复刻学习交流
      </footer>
      <Toast />
    </BrowserRouter>
  );
}

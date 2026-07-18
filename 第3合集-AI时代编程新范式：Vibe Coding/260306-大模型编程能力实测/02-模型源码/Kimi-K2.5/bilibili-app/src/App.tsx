import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { VideoDetail } from './pages/VideoDetail';
import { Search } from './pages/Search';
import { Login } from './pages/Login';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { useUserStore } from './stores/user';
import { checkLoginStatus } from './api/bilibili';

const themeConfig = {
  token: {
    colorPrimary: '#00AEEC',
    colorInfo: '#00AEEC',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
    },
    Card: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
    },
  },
};

function App() {
  const { setLogin, logout } = useUserStore();

  useEffect(() => {
    const initAuth = async () => {
      const status = await checkLoginStatus();
      if (status.isLogin && status.userInfo) {
        const sessdata = localStorage.getItem('bilibili_sessdata') || '';
        const csrf = localStorage.getItem('bilibili_csrf') || '';
        setLogin(status.userInfo, sessdata, csrf);
      } else {
        logout();
      }
    };

    initAuth();
  }, [setLogin, logout]);

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <Router>
          <div style={{ minHeight: '100vh', background: '#F1F2F3' }}>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/video/:bvid" element={<VideoDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;

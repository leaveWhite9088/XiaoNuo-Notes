import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';
import { LoginPage } from './pages/LoginPage';
import { UserCenterPage } from './pages/UserCenterPage';
import { SearchPage } from './components/search/SearchPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/video/:bvid" element={<VideoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user" element={<UserCenterPage />} />
          <Route path="/user/favorites" element={<UserCenterPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
};

export default App;
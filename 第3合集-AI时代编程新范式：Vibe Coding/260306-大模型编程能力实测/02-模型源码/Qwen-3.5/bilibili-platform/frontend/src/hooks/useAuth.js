import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    try {
      const res = await userApi.check();
      if (res.data.success && res.data.data.isLogin) {
        const userRes = await userApi.getInfo();
        if (userRes.data.success) {
          setUser(userRes.data.data);
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setIsLogin(true);
    checkLogin();
  }

  async function logout() {
    try {
      await userApi.logout();
      setUser(null);
      setIsLogin(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLogin, loading, login, logout, checkLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  mid: number;
  uname: string;
  face: string;
  cookie: string;
  csrf: string;
  isLogin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ code: number; message: string }>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = async () => {
    try {
      const res = await authApi.getStatus();
      if (res.code === 0 && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await authApi.login(username, password);
      if (res.code === 0 && res.data?.user) {
        setUser(res.data.user);
      }
      return { code: res.code, message: res.message };
    } catch (error: any) {
      return { code: -1, message: error.message || '登录失败' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
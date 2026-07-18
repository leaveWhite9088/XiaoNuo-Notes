import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo } from '../types';

interface UserState {
  isLogin: boolean;
  userInfo: UserInfo | null;
  sessdata: string | null;
  csrf: string | null;
  setLogin: (userInfo: UserInfo, sessdata: string, csrf: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLogin: false,
      userInfo: null,
      sessdata: null,
      csrf: null,
      setLogin: (userInfo, sessdata, csrf) => {
        localStorage.setItem('bilibili_sessdata', sessdata);
        localStorage.setItem('bilibili_csrf', csrf);
        set({ isLogin: true, userInfo, sessdata, csrf });
      },
      logout: () => {
        localStorage.removeItem('bilibili_sessdata');
        localStorage.removeItem('bilibili_csrf');
        set({ isLogin: false, userInfo: null, sessdata: null, csrf: null });
      },
    }),
    {
      name: 'bilibili-user-storage',
    }
  )
);

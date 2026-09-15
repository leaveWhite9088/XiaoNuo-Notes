/**
 * 全站配置（导航、分区、排序、热搜）在应用启动时拉取一次，通过 context 共享。
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { fetchNavConfig } from '../api/bili';
import { useAsync } from '../hooks/useAsync';
import type { NavConfig } from '../types';

const FALLBACK: NavConfig = {
  primaryNav: [],
  channels: [],
  morePanel: [],
  sorts: [],
  hotSearches: [],
  searchPlaceholders: ['大家都在搜'],
};

const ConfigContext = createContext<{ config: NavConfig; ready: boolean }>({
  config: FALLBACK,
  ready: false,
});

export function ConfigProvider({ children }: { children: ReactNode }) {
  const { data } = useAsync(() => fetchNavConfig(), []);
  return (
    <ConfigContext.Provider value={{ config: data ?? FALLBACK, ready: Boolean(data) }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}

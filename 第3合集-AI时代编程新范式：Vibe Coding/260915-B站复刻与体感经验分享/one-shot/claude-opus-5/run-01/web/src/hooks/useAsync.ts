import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * 轻量的数据请求 hook：依赖变化时重新拉取，并忽略过期响应。
 */
export function useAsync<T>(factory: () => Promise<T>, deps: unknown[]): AsyncState<T> & {
  reload: () => void;
} {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const latest = useRef(0);

  const run = useCallback(() => {
    const id = ++latest.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    factory()
      .then((data) => {
        if (latest.current === id) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (latest.current === id) setState({ data: null, loading: false, error: err.message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run, tick]);

  return { ...state, reload: () => setTick((n) => n + 1) };
}

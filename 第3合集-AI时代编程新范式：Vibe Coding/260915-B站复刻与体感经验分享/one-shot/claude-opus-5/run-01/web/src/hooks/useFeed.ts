/**
 * 首页信息流状态：分区筛选 / 排序 / 翻页追加 / 换一换。
 * 所有查询参数放在同一个 state 里原子更新，避免切换分区时发出重复请求。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFeed } from '../api/bili';
import type { VideoCardData } from '../types';

interface Query {
  channel: string;
  sort: string;
  page: number;
  refresh: number;
}

const PAGE_SIZE = 20;

export function useFeed(channel: string, sort: string) {
  const [query, setQuery] = useState<Query>({ channel, sort, page: 1, refresh: 0 });
  const [items, setItems] = useState<VideoCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // 外部（URL / 排序 tab）变化时重置到第一页
  useEffect(() => {
    setQuery((prev) =>
      prev.channel === channel && prev.sort === sort ? prev : { channel, sort, page: 1, refresh: 0 },
    );
  }, [channel, sort]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fetchFeed({
      channel: query.channel,
      sort: query.sort,
      page: query.page,
      pageSize: PAGE_SIZE,
      refresh: query.refresh,
    })
      .then((res) => {
        if (requestId.current !== id) return;
        setItems((prev) => (query.page === 1 ? res.items : [...prev, ...res.items]));
        setHasMore(res.hasMore);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (requestId.current !== id) return;
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  const loadMore = useCallback(() => {
    setQuery((prev) => ({ ...prev, page: prev.page + 1 }));
  }, []);

  /** 换一换：整体旋转推荐位并回到第一页 */
  const shuffle = useCallback(() => {
    setQuery((prev) => ({ ...prev, page: 1, refresh: prev.refresh + 1 }));
  }, []);

  return { items, loading, hasMore, error, loadMore, shuffle, page: query.page };
}

export { PAGE_SIZE };

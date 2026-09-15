import type { Category, DetailData, FeedPage, SuggestItem } from '../types';

const BASE = '/api';

async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(BASE + path, { signal });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  const body = await res.json();
  if (body.code !== 0) throw new Error(`${path} -> code ${body.code}`);
  return body.data as T;
}

let categoriesCache: Promise<Category[]> | null = null;

export const api = {
  categories(): Promise<Category[]> {
    if (!categoriesCache) {
      categoriesCache = getJSON<Category[]>('/categories').catch((e) => {
        categoriesCache = null;
        throw e;
      });
    }
    return categoriesCache;
  },
  feed(cat: string, page = 1, size = 24, signal?: AbortSignal): Promise<FeedPage> {
    return getJSON<FeedPage>(`/feed?cat=${encodeURIComponent(cat)}&page=${page}&size=${size}`, signal);
  },
  detail(id: number | string): Promise<DetailData> {
    return getJSON<DetailData>(`/video/${encodeURIComponent(String(id))}`);
  },
  suggest(kw: string): Promise<{ items: SuggestItem[]; live: boolean }> {
    return getJSON(`/search/suggest?kw=${encodeURIComponent(kw)}`);
  },
  search(q: string, page = 1): Promise<FeedPage> {
    return getJSON<FeedPage>(`/search?q=${encodeURIComponent(q)}&page=${page}`);
  },
};

const BASE = '/api';

async function request(url) {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || '接口返回异常');
  }
  return json.data;
}

// 视频列表：category=推荐|热门|具体分类，分页 page/pageSize
export function fetchVideos({ category = '推荐', page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ category, page, pageSize });
  return request(`/videos?${params}`);
}

// 视频详情（含相关推荐）
export function fetchVideoDetail(id) {
  return request(`/videos/${encodeURIComponent(id)}`);
}

// Banner 轮播
export function fetchBanners() {
  return request('/banners');
}

// 搜索结果
export function searchVideos(keyword) {
  return request(`/search?keyword=${encodeURIComponent(keyword)}`);
}

// 搜索建议
export function fetchSuggest(q) {
  return request(`/search/suggest?q=${encodeURIComponent(q)}`);
}

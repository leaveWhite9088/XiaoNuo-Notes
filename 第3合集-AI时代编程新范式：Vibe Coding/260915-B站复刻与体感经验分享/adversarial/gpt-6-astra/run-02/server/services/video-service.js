import { videos, categories, banners } from "../data/videos.js";
export function getHome({ q = "", category = "全部", page = 1 } = {}) {
  const query = String(q).trim().toLowerCase();
  const filtered = videos.filter(
    (v) =>
      (category === "全部" || v.category === category) &&
      (!query ||
        `${v.title} ${v.author} ${v.category}`.toLowerCase().includes(query)),
  );
  const size = 20;
  const current = Math.max(1, parseInt(page) || 1);
  return {
    videos: filtered.slice((current - 1) * size, current * size),
    total: filtered.length,
    page: current,
    hasMore: current * size < filtered.length,
    banners,
  };
}
export function getVideo(id) {
  const video = videos.find((v) => v.id === id);
  return video
    ? {
        ...video,
        related: videos
          .filter((v) => v.id !== id)
          .sort(
            (a, b) =>
              Number(b.category === video.category) -
              Number(a.category === video.category),
          )
          .slice(0, 8),
      }
    : null;
}
export function getSuggestions(q = "") {
  const query = String(q).trim().toLowerCase();
  return query
    ? [
        ...new Set(
          videos
            .filter((v) =>
              `${v.title} ${v.author} ${v.category}`
                .toLowerCase()
                .includes(query),
            )
            .map((v) => v.title),
        ),
      ].slice(0, 6)
    : ["秋日旅行计划", "美食", "音乐", "猫咪", "科技", "游戏"];
}
export { categories };

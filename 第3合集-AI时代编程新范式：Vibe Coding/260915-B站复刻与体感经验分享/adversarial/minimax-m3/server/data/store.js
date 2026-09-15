/**
 * 数据装载：从 videos.json 读取全部视频/UP主/分区
 * 对外暴露 loadAll()，返回一个内存 store
 */
const fs = require('fs');
const path = require('path');

function loadAll() {
  const dataPath = path.join(__dirname, 'videos.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw);
  // 索引 videoById 方便详情
  const videoById = {};
  for (const v of data.videos) videoById[v.id] = v;
  const upById = {};
  for (const u of data.ups) upById[u.id] = u;
  return {
    categories: data.categories,
    videos: data.videos,
    ups: data.ups,
    ranking: data.ranking,
    hotSearches: data.hotSearches,
    videoById,
    upById,
  };
}

module.exports = { loadAll };

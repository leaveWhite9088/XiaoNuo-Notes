-- ============================================================
--  B站首页复刻 · 数据库结构 (SQLite / node:sqlite)
--  分层：schema 只描述表结构，迁移与种子数据分别由 index.js / scripts/seed.mjs 负责
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 分区（番剧 / 动画 / 游戏 ...）
CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  rid         INTEGER,
  icon        TEXT,
  accent      TEXT,
  intro       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_nav      INTEGER NOT NULL DEFAULT 0,  -- 是否出现在顶部主导航下方分区条
  is_filter   INTEGER NOT NULL DEFAULT 1   -- 是否出现在首页信息流筛选条
);

-- UP 主
CREATE TABLE IF NOT EXISTS users (
  mid         INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  face        TEXT,
  sign        TEXT,
  follower    INTEGER NOT NULL DEFAULT 0,
  following   INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 6,
  vip         INTEGER NOT NULL DEFAULT 0,
  archive_count INTEGER NOT NULL DEFAULT 0,
  likes       INTEGER NOT NULL DEFAULT 0
);

-- 视频主表
CREATE TABLE IF NOT EXISTS videos (
  bvid        TEXT    PRIMARY KEY,
  aid         INTEGER,
  cid         INTEGER,
  title       TEXT    NOT NULL,
  description TEXT,
  cover       TEXT    NOT NULL,
  duration    INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  tags        TEXT    NOT NULL DEFAULT '[]',
  owner_mid   INTEGER,
  owner_name  TEXT,
  owner_face  TEXT,
  pubdate     INTEGER,
  created_at  INTEGER NOT NULL DEFAULT 0,
  featured    INTEGER NOT NULL DEFAULT 0,
  /* 可播放性探测：NULL=未探测, 1=可播放, 0=版权内容/无播放地址 */
  playable    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_pubdate  ON videos(pubdate DESC);

-- 视频统计（一对一）
CREATE TABLE IF NOT EXISTS video_stats (
  bvid        TEXT    PRIMARY KEY REFERENCES videos(bvid) ON DELETE CASCADE,
  view        INTEGER NOT NULL DEFAULT 0,
  danmaku     INTEGER NOT NULL DEFAULT 0,
  reply       INTEGER NOT NULL DEFAULT 0,
  favorite    INTEGER NOT NULL DEFAULT 0,
  coin        INTEGER NOT NULL DEFAULT 0,
  share       INTEGER NOT NULL DEFAULT 0,
  like_count  INTEGER NOT NULL DEFAULT 0,
  score       REAL    NOT NULL DEFAULT 0,
  rank        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stats_score ON video_stats(score DESC);

-- 首页轮播 Banner
CREATE TABLE IF NOT EXISTS banners (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  subtitle    TEXT,
  image       TEXT    NOT NULL,
  link        TEXT,
  bvid        TEXT,
  badge       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 评论
CREATE TABLE IF NOT EXISTS comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid        TEXT    NOT NULL,
  mid         INTEGER,
  user_name   TEXT    NOT NULL,
  user_face   TEXT,
  content     TEXT    NOT NULL,
  like_count  INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  location    TEXT,
  ctime       INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_comments_bvid ON comments(bvid, like_count DESC);

-- 弹幕（详情页播放器使用）
CREATE TABLE IF NOT EXISTS danmaku (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid        TEXT    NOT NULL,
  time_ms     INTEGER NOT NULL,
  content     TEXT    NOT NULL,
  color       TEXT    NOT NULL DEFAULT '#FFFFFF',
  mode        INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_danmaku_bvid ON danmaku(bvid, time_ms);

-- 热搜 / 搜索建议词库
CREATE TABLE IF NOT EXISTS hot_searches (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword     TEXT    NOT NULL UNIQUE,
  tag         TEXT,
  heat        INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 搜索历史（后端持久化，前端也会缓存一份）
CREATE TABLE IF NOT EXISTS search_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword     TEXT    NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT 0
);

-- 观看历史
CREATE TABLE IF NOT EXISTS watch_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid        TEXT    NOT NULL,
  title       TEXT,
  cover       TEXT,
  progress    INTEGER NOT NULL DEFAULT 0,
  duration    INTEGER NOT NULL DEFAULT 0,
  updated_at  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(bvid)
);

-- 收藏
CREATE TABLE IF NOT EXISTS favorites (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid        TEXT    NOT NULL UNIQUE,
  created_at  INTEGER NOT NULL DEFAULT 0
);

-- 分区排行（服务端预计算，首页右侧排行卡使用）
CREATE TABLE IF NOT EXISTS ranking (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER REFERENCES categories(id),
  bvid        TEXT    NOT NULL,
  score       REAL    NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ranking_cat ON ranking(category_id, position);

-- 版权内容（番剧 / 国创 / 综艺）：来自 B站 PGC 季榜，仅作分区页展示
CREATE TABLE IF NOT EXISTS pgc_items (
  season_id   INTEGER PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  title       TEXT    NOT NULL,
  cover       TEXT    NOT NULL,
  horizontal_cover TEXT,
  rating      TEXT,
  play_text   TEXT,
  badge       TEXT,
  badge_color TEXT,
  update_info TEXT,
  url         TEXT,
  rank        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_pgc_cat ON pgc_items(category_id, rank);

-- bilibili 首页复刻 · 数据库结构
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  slug    TEXT NOT NULL UNIQUE,
  name    TEXT NOT NULL,
  rid     INTEGER NOT NULL DEFAULT 0,
  icon    TEXT NOT NULL DEFAULT '',
  sort    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS owners (
  mid     INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  avatar  TEXT NOT NULL DEFAULT '',
  sign    TEXT NOT NULL DEFAULT '',
  fans    INTEGER NOT NULL DEFAULT 0,
  videos  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS videos (
  bvid          TEXT PRIMARY KEY,
  aid           INTEGER NOT NULL DEFAULT 0,
  cid           INTEGER NOT NULL DEFAULT 0,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  cover         TEXT NOT NULL DEFAULT '',
  video_url     TEXT NOT NULL DEFAULT '',
  duration      INTEGER NOT NULL DEFAULT 0,
  -- 演示播放源的真实片长（ffprobe 实测），与上面的 duration（B 站原始时长）不是一回事
  clip_duration REAL NOT NULL DEFAULT 0,
  pubdate       INTEGER NOT NULL DEFAULT 0,
  tname         TEXT NOT NULL DEFAULT '',
  category_slug TEXT NOT NULL DEFAULT 'life',
  play          INTEGER NOT NULL DEFAULT 0,
  danmaku       INTEGER NOT NULL DEFAULT 0,
  like_count    INTEGER NOT NULL DEFAULT 0,
  coin          INTEGER NOT NULL DEFAULT 0,
  favorite      INTEGER NOT NULL DEFAULT 0,
  reply         INTEGER NOT NULL DEFAULT 0,
  share         INTEGER NOT NULL DEFAULT 0,
  owner_mid     INTEGER NOT NULL DEFAULT 0,
  hot_score     REAL NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (owner_mid) REFERENCES owners(mid)
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_slug);
CREATE INDEX IF NOT EXISTS idx_videos_hot ON videos(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_videos_pubdate ON videos(pubdate DESC);
CREATE INDEX IF NOT EXISTS idx_videos_owner ON videos(owner_mid);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid  TEXT NOT NULL,
  name  TEXT NOT NULL,
  FOREIGN KEY (bvid) REFERENCES videos(bvid) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tags_bvid ON tags(bvid);

CREATE TABLE IF NOT EXISTS banners (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  title    TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  image    TEXT NOT NULL,
  link     TEXT NOT NULL DEFAULT '',
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hot_searches (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL UNIQUE,
  sort    INTEGER NOT NULL DEFAULT 0
);

-- source: seed = 由 seed.json 生成的演示内容；user = 用户真实发表（重复执行 seed 不会清除）
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid       TEXT NOT NULL,
  author     TEXT NOT NULL,
  avatar     TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  source     TEXT NOT NULL DEFAULT 'seed',
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (bvid) REFERENCES videos(bvid) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_bvid ON comments(bvid, like_count DESC);

-- source 同上；time_ms 保证落在演示片长之内（seed 按真实片长裁剪）
CREATE TABLE IF NOT EXISTS danmaku (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid    TEXT NOT NULL,
  time_ms INTEGER NOT NULL,
  text    TEXT NOT NULL,
  color   TEXT NOT NULL DEFAULT '#ffffff',
  mode    INTEGER NOT NULL DEFAULT 1,
  source  TEXT NOT NULL DEFAULT 'seed'
);
CREATE INDEX IF NOT EXISTS idx_danmaku_bvid ON danmaku(bvid, time_ms);

-- 当前用户对视频的互动状态（单用户演示）
CREATE TABLE IF NOT EXISTS interactions (
  bvid       TEXT PRIMARY KEY,
  liked      INTEGER NOT NULL DEFAULT 0,
  coined     INTEGER NOT NULL DEFAULT 0,
  faved      INTEGER NOT NULL DEFAULT 0,
  followed   INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS watch_history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  bvid       TEXT NOT NULL,
  progress   REAL NOT NULL DEFAULT 0,
  watched_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (bvid) REFERENCES videos(bvid) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_history_time ON watch_history(watched_at DESC);

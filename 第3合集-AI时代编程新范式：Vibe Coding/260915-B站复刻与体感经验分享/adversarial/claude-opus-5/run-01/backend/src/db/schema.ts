/** 数据层表结构。内容表每次启动按 seed.json 重建，用户行为表持久保留。 */
export const CONTENT_SCHEMA = `
DROP TABLE IF EXISTS video_tags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS danmaku;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS hot_searches;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS channels;

CREATE TABLE channels (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  icon        TEXT NOT NULL,
  color       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL
);

CREATE TABLE owners (
  mid         INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  face        TEXT NOT NULL,
  sign        TEXT NOT NULL DEFAULT '',
  fans        INTEGER NOT NULL DEFAULT 0,
  video_count INTEGER NOT NULL DEFAULT 0,
  level       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE videos (
  bvid            TEXT PRIMARY KEY,
  aid             INTEGER,
  cid             INTEGER,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  cover           TEXT NOT NULL,
  play_url        TEXT NOT NULL,
  duration        INTEGER NOT NULL,
  pubdate         INTEGER NOT NULL,
  channel_id      TEXT NOT NULL REFERENCES channels(id),
  partition_name  TEXT NOT NULL,
  owner_mid       INTEGER NOT NULL REFERENCES owners(mid),
  view_count      INTEGER NOT NULL DEFAULT 0,
  danmaku_count   INTEGER NOT NULL DEFAULT 0,
  reply_count     INTEGER NOT NULL DEFAULT 0,
  favorite_count  INTEGER NOT NULL DEFAULT 0,
  coin_count      INTEGER NOT NULL DEFAULT 0,
  share_count     INTEGER NOT NULL DEFAULT 0,
  like_count      INTEGER NOT NULL DEFAULT 0,
  copyright       INTEGER NOT NULL DEFAULT 1,
  pub_location    TEXT NOT NULL DEFAULT '',
  width           INTEGER NOT NULL DEFAULT 1920,
  height          INTEGER NOT NULL DEFAULT 1080,
  hot_score       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_videos_channel ON videos(channel_id);
CREATE INDEX idx_videos_hot ON videos(hot_score DESC);
CREATE INDEX idx_videos_pubdate ON videos(pubdate DESC);

CREATE TABLE video_tags (
  bvid TEXT NOT NULL REFERENCES videos(bvid),
  tag  TEXT NOT NULL
);
CREATE INDEX idx_video_tags_bvid ON video_tags(bvid);

CREATE TABLE comments (
  id          TEXT PRIMARY KEY,
  bvid        TEXT NOT NULL REFERENCES videos(bvid),
  mid         INTEGER NOT NULL REFERENCES owners(mid),
  content     TEXT NOT NULL,
  like_count  INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  ctime       INTEGER NOT NULL
);
CREATE INDEX idx_comments_bvid ON comments(bvid);

CREATE TABLE danmaku (
  id       TEXT PRIMARY KEY,
  bvid     TEXT NOT NULL REFERENCES videos(bvid),
  time_sec REAL NOT NULL,
  mode     TEXT NOT NULL DEFAULT 'scroll',
  color    TEXT NOT NULL DEFAULT '#ffffff',
  content  TEXT NOT NULL
);
CREATE INDEX idx_danmaku_bvid ON danmaku(bvid);

CREATE TABLE banners (
  id     TEXT PRIMARY KEY,
  bvid   TEXT NOT NULL REFERENCES videos(bvid),
  title  TEXT NOT NULL,
  image  TEXT NOT NULL,
  badge  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE hot_searches (
  rank_no   INTEGER PRIMARY KEY,
  keyword   TEXT NOT NULL,
  show_name TEXT NOT NULL
);
`;

/** 用户侧状态：点赞 / 投币 / 收藏 / 观看历史 / 稍后再看 / 搜索历史，跨重启保留 */
export const USER_SCHEMA = `
CREATE TABLE IF NOT EXISTS user_actions (
  bvid   TEXT NOT NULL,
  action TEXT NOT NULL,
  value  INTEGER NOT NULL DEFAULT 1,
  ctime  INTEGER NOT NULL,
  PRIMARY KEY (bvid, action)
);

CREATE TABLE IF NOT EXISTS watch_history (
  bvid       TEXT PRIMARY KEY,
  progress   REAL NOT NULL DEFAULT 0,
  play_count INTEGER NOT NULL DEFAULT 0,
  vtime      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS search_history (
  keyword TEXT PRIMARY KEY,
  ctime   INTEGER NOT NULL
);
`;

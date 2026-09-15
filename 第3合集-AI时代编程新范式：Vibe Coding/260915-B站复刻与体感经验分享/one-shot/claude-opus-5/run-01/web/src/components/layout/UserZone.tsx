/**
 * 顶栏右侧用户区：头像卡片、大会员、消息、动态、收藏、历史、投稿。
 * 每个入口都是 hover 展开面板（HoverPanel），其中「历史」读取真实的本地观看记录。
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HoverPanel } from '../common/HoverPanel';
import { Icon } from '../common/Icon';
import type { IconName } from '../common/Icon';
import { fetchFeed } from '../../api/bili';
import { readWatchHistory } from '../../utils/watchHistory';
import type { HistoryEntry } from '../../utils/watchHistory';
import type { VideoCardData } from '../../types';
import { formatRelativeTime } from '../../utils/format';
import './user-zone.css';

const CURRENT_USER = {
  name: '哔哩哔哩用户',
  avatar: '/media/avatars/avatar-7.jpg',
  level: 6,
  coins: 1024,
  following: 286,
  followers: 42,
  dynamics: 37,
};

export function UserZone() {
  const [dynamics, setDynamics] = useState<VideoCardData[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    fetchFeed({ sort: 'latest', pageSize: 6 })
      .then((res) => setDynamics(res.items))
      .catch(() => setDynamics([]));
  }, []);

  useEffect(() => {
    const sync = () => setHistory(readWatchHistory());
    sync();
    window.addEventListener('bili:history-change', sync);
    return () => window.removeEventListener('bili:history-change', sync);
  }, []);

  return (
    <div className="user-zone">
      <HoverPanel
        className="user-zone__avatar-wrap"
        align="right"
        panelClassName="user-card"
        trigger={
          <span className="user-zone__avatar">
            <img src={CURRENT_USER.avatar} alt="头像" />
            <i className="user-zone__level">Lv{CURRENT_USER.level}</i>
          </span>
        }
      >
        <div className="user-card__head">
          <img className="user-card__avatar" src={CURRENT_USER.avatar} alt="头像" />
          <div>
            <div className="user-card__name">
              {CURRENT_USER.name}
              <span className="user-card__badge">Lv{CURRENT_USER.level}</span>
            </div>
            <div className="user-card__vip">
              <Icon name="vip" size={12} /> 年度大会员
            </div>
          </div>
        </div>
        <div className="user-card__stats">
          {[
            ['动态', CURRENT_USER.dynamics],
            ['关注', CURRENT_USER.following],
            ['粉丝', CURRENT_USER.followers],
          ].map(([label, value]) => (
            <div key={label as string}>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <ul className="user-card__menu">
          {(
            [
              ['个人中心', 'dynamic'],
              ['投稿管理', 'upload'],
              ['我的收藏', 'star'],
              ['稍后再看', 'watch-later'],
              ['历史记录', 'history'],
            ] as [string, IconName][]
          ).map(([label, icon]) => (
            <li key={label}>
              <Icon name={icon} size={15} />
              {label}
            </li>
          ))}
        </ul>
        <button className="user-card__logout">退出登录</button>
      </HoverPanel>

      <HoverPanel
        className="user-zone__entry"
        align="center"
        panelClassName="mini-panel"
        trigger={
          <span className="user-zone__entry-inner user-zone__entry--vip">
            <Icon name="vip" size={18} />
            <span>大会员</span>
          </span>
        }
      >
        <div className="mini-panel__title">大会员权益</div>
        <ul className="mini-panel__list">
          {['1080P+ 高清画质', '会员专享片库', '每月 B 币券', '专属装扮与表情'].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button className="mini-panel__cta">立即续费</button>
      </HoverPanel>

      <HoverPanel
        className="user-zone__entry"
        align="center"
        panelClassName="mini-panel"
        trigger={
          <span className="user-zone__entry-inner">
            <Icon name="bell" size={18} />
            <span>消息</span>
            <i className="user-zone__dot">3</i>
          </span>
        }
      >
        <div className="mini-panel__title">消息中心</div>
        <ul className="mini-panel__list mini-panel__list--msg">
          {[
            ['回复我的', 2],
            ['@ 我的', 0],
            ['收到的赞', 1],
            ['系统通知', 0],
            ['我的消息', 0],
          ].map(([label, count]) => (
            <li key={label as string}>
              <span>{label}</span>
              {Number(count) > 0 && <i className="mini-panel__count">{count}</i>}
            </li>
          ))}
        </ul>
      </HoverPanel>

      <HoverPanel
        className="user-zone__entry"
        align="center"
        panelClassName="list-panel"
        trigger={
          <span className="user-zone__entry-inner">
            <Icon name="dynamic" size={18} />
            <span>动态</span>
          </span>
        }
      >
        <div className="list-panel__head">
          <span>最新动态</span>
          <span className="list-panel__more">全部</span>
        </div>
        <ul className="list-panel__list">
          {dynamics.map((item) => (
            <li key={item.bvid}>
              <Link to={`/video/${item.bvid}`} className="list-panel__item">
                <img src={item.cover} alt="" />
                <div>
                  <p className="text-clamp-2">{item.title}</p>
                  <span>
                    {item.up.name} · {formatRelativeTime(item.publishedAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </HoverPanel>

      <HoverPanel
        className="user-zone__entry"
        align="center"
        panelClassName="mini-panel"
        trigger={
          <span className="user-zone__entry-inner">
            <Icon name="star" size={18} />
            <span>收藏</span>
          </span>
        }
      >
        <div className="mini-panel__title">我的收藏夹</div>
        <ul className="mini-panel__list mini-panel__list--msg">
          {[
            ['默认收藏夹', 128],
            ['技术向', 46],
            ['下饭视频', 92],
            ['学习区', 31],
          ].map(([label, count]) => (
            <li key={label as string}>
              <span>{label}</span>
              <i className="mini-panel__count mini-panel__count--plain">{count}</i>
            </li>
          ))}
        </ul>
      </HoverPanel>

      <HoverPanel
        className="user-zone__entry"
        align="center"
        panelClassName="list-panel"
        trigger={
          <span className="user-zone__entry-inner">
            <Icon name="history" size={18} />
            <span>历史</span>
          </span>
        }
      >
        <div className="list-panel__head">
          <span>最近观看</span>
          <span className="list-panel__more">查看全部</span>
        </div>
        {history.length === 0 ? (
          <p className="list-panel__empty">还没有观看记录，去首页看看吧~</p>
        ) : (
          <ul className="list-panel__list">
            {history.map((item) => (
              <li key={item.bvid}>
                <Link to={`/video/${item.bvid}`} className="list-panel__item">
                  <img src={item.cover} alt="" />
                  <div>
                    <p className="text-clamp-2">{item.title}</p>
                    <span>{item.upName}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HoverPanel>

      <HoverPanel
        className="user-zone__upload"
        align="right"
        panelClassName="mini-panel"
        trigger={
          <span className="user-zone__upload-btn">
            <Icon name="upload" size={16} />
            投稿
          </span>
        }
      >
        <div className="mini-panel__title">创作中心</div>
        <ul className="mini-panel__list mini-panel__list--grid">
          {['视频投稿', '专栏投稿', '音频投稿', '相簿投稿', '课程投稿', '互动视频'].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </HoverPanel>
    </div>
  );
}

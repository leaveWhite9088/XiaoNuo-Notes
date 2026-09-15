import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { Icon } from '../common/Icon';
import './UserPanel.css';

const SHORTCUTS = [
  '我的收藏',
  '稍后再看',
  '历史记录',
  '我的追番',
  '我的课程',
  '个人中心',
  '推荐服务',
  '设置',
];

/** 顶栏头像悬浮卡片：账号信息 + 快捷入口（演示态为单用户本地数据） */
export function UserPanel() {
  const { data: watchLater = [] } = useQuery({ queryKey: ['me', 'watchlater'], queryFn: api.watchLater });
  const { data: favorites = [] } = useQuery({ queryKey: ['me', 'favorites'], queryFn: api.favorites });
  const { data: history = [] } = useQuery({ queryKey: ['me', 'history'], queryFn: api.history });

  return (
    <div className="user-panel">
      <div className="user-panel__head">
        <img className="user-panel__avatar" src="/media/avatars/mine.jpg" alt="" />
        <div className="user-panel__meta">
          <div className="user-panel__name">
            干杯的旅行者
            <span className="user-panel__level">LV6</span>
          </div>
          <div className="user-panel__vip">
            <Icon name="vip" size={14} />
            年度大会员
          </div>
        </div>
      </div>

      <div className="user-panel__stats">
        <div>
          <strong>{favorites.length}</strong>
          <span>收藏</span>
        </div>
        <div>
          <strong>{watchLater.length}</strong>
          <span>稍后再看</span>
        </div>
        <div>
          <strong>{history.length}</strong>
          <span>历史</span>
        </div>
      </div>

      <div className="user-panel__wallet">
        <div>
          <strong>1024</strong>
          <span>硬币</span>
        </div>
        <div>
          <strong>66</strong>
          <span>B 币</span>
        </div>
        <div className="user-panel__wallet-action">
          <button>+ 充值</button>
        </div>
      </div>

      <ul className="user-panel__grid">
        {SHORTCUTS.map((item) => (
          <li key={item}>
            <button>{item}</button>
          </li>
        ))}
      </ul>

      <footer className="user-panel__footer">
        <button>退出登录</button>
      </footer>
    </div>
  );
}

/** 播放页互动栏：点赞 / 投币 / 收藏 / 分享（点击会真实回写后端计数）。 */
import { useState } from 'react';
import { Icon } from '../common/Icon';
import type { IconName } from '../common/Icon';
import { interactVideo } from '../../api/bili';
import { formatCount } from '../../utils/format';
import './action-bar.css';

type Action = 'like' | 'coin' | 'favorite' | 'share';

interface Props {
  bvid: string;
  stats: { like: number; coin: number; favorite: number; share: number };
}

const ITEMS: { action: Action; icon: IconName; label: string }[] = [
  { action: 'like', icon: 'like', label: '点赞' },
  { action: 'coin', icon: 'coin', label: '投币' },
  { action: 'favorite', icon: 'star', label: '收藏' },
  { action: 'share', icon: 'share', label: '分享' },
];

export function ActionBar({ bvid, stats }: Props) {
  const [counts, setCounts] = useState(stats);
  const [actived, setActived] = useState<Record<Action, boolean>>({
    like: false,
    coin: false,
    favorite: false,
    share: false,
  });
  const [toast, setToast] = useState('');

  const run = async (action: Action) => {
    const next = !actived[action];
    const delta = action === 'share' ? 1 : next ? 1 : -1;
    setActived((prev) => ({ ...prev, [action]: action === 'share' ? prev.share : next }));
    setCounts((prev) => ({ ...prev, [action]: Math.max(0, prev[action] + delta) }));
    setToast(action === 'share' ? '链接已复制' : next ? '操作成功' : '已取消');
    window.setTimeout(() => setToast(''), 1200);
    try {
      const res = await interactVideo(bvid, action, delta);
      setCounts((prev) => ({ ...prev, [action]: res.value }));
    } catch {
      /* 演示项目：失败时保留乐观更新的结果 */
    }
  };

  return (
    <div className="action-bar">
      {ITEMS.map((item) => (
        <button
          key={item.action}
          className={`action-bar__item ${actived[item.action] ? 'is-active' : ''}`}
          onClick={() => void run(item.action)}
          title={item.label}
        >
          <Icon name={item.icon} size={26} />
          <span>{formatCount(counts[item.action])}</span>
        </button>
      ))}
      <div className="action-bar__tip">长按点赞可以一键三连哦</div>
      {toast && <div className="action-bar__toast">{toast}</div>}
    </div>
  );
}

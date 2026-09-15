import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/endpoints';
import { syncVideoInteraction } from '../../api/sync';
import { Icon, type IconName } from '../common/Icon';
import { formatCount } from '../../utils/format';
import type { StatSnapshot, VideoDetail } from '../../types';
import './ActionBar.css';

type ActionKey = 'like' | 'coin' | 'favorite';

const BUTTONS: { key: ActionKey; icon: IconName; label: string }[] = [
  { key: 'like', icon: 'like', label: '点赞' },
  { key: 'coin', icon: 'coin', label: '投币' },
  { key: 'favorite', icon: 'star', label: '收藏' },
];

/** 点赞 / 投币 / 收藏 / 分享，长按点赞触发一键三连 */
export function ActionBar({ video }: { video: VideoDetail }) {
  const queryClient = useQueryClient();
  const [actions, setActions] = useState(video.actions);
  const [stat, setStat] = useState({
    like: video.stat.like,
    coin: video.stat.coin,
    favorite: video.stat.favorite,
    share: video.stat.share,
  });
  const [toast, setToast] = useState('');
  const [tripling, setTripling] = useState(false);
  const pressTimer = useRef<number | undefined>(undefined);
  const tripleFired = useRef(false);

  useEffect(() => {
    setActions(video.actions);
    setStat({
      like: video.stat.like,
      coin: video.stat.coin,
      favorite: video.stat.favorite,
      share: video.stat.share,
    });
  }, [video]);

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 1600);
  };

  const applyStat = (snapshot: StatSnapshot) =>
    setStat({
      like: snapshot.like_count,
      coin: snapshot.coin_count,
      favorite: snapshot.favorite_count,
      share: snapshot.share_count,
    });

  const toggle = useMutation({
    mutationFn: (action: ActionKey) => api.toggleAction(video.bvid, action),
    onSuccess: (data) => {
      setActions((prev) => ({ ...prev, [data.action]: data.active }));
      applyStat(data.stat);
      syncVideoInteraction(queryClient, video.bvid, {
        actions: { [data.action]: data.active },
        stat: data.stat,
      });
      const label = BUTTONS.find((b) => b.key === data.action)?.label ?? '';
      showToast(data.active ? `${label}成功` : `已取消${label}`);
    },
  });

  const triple = useMutation({
    mutationFn: () => api.triple(video.bvid),
    onSuccess: (data) => {
      setActions(data.actions);
      applyStat(data.stat);
      syncVideoInteraction(queryClient, video.bvid, { actions: data.actions, stat: data.stat });
      showToast('一键三连成功，UP 主收到了你的鼓励');
    },
  });

  // 长按点赞 0.55s 触发一键三连
  const startPress = () => {
    tripleFired.current = false;
    pressTimer.current = window.setTimeout(() => {
      tripleFired.current = true;
      setTripling(true);
      triple.mutate();
      window.setTimeout(() => setTripling(false), 900);
    }, 550);
  };
  const endPress = () => window.clearTimeout(pressTimer.current);
  // 长按后鼠标移出再松开不会产生 click，这里复位标记，避免吞掉下一次点赞
  const leavePress = () => {
    endPress();
    tripleFired.current = false;
  };

  return (
    <div className={`action-bar ${tripling ? 'is-tripling' : ''}`}>
      {BUTTONS.map((b) => (
        <button
          key={b.key}
          className={`action-bar__btn ${actions[b.key] ? 'is-active' : ''}`}
          title={b.key === 'like' ? '长按一键三连' : b.label}
          onMouseDown={b.key === 'like' ? startPress : undefined}
          onMouseUp={b.key === 'like' ? endPress : undefined}
          onMouseLeave={b.key === 'like' ? leavePress : undefined}
          onClick={() => {
            // 长按已触发三连时，抬起鼠标带出的这次 click 不再切换点赞
            if (b.key === 'like' && tripleFired.current) {
              tripleFired.current = false;
              return;
            }
            toggle.mutate(b.key);
          }}
        >
          <Icon name={b.icon} size={26} />
          <span>{formatCount(stat[b.key])}</span>
        </button>
      ))}

      <button
        className="action-bar__btn"
        onClick={() => {
          // 分享仅做前端演示：复制链接并本地 +1，不写回服务端统计
          void navigator.clipboard?.writeText(`${location.origin}/video/${video.bvid}`).catch(() => undefined);
          setStat((prev) => ({ ...prev, share: prev.share + 1 }));
          showToast('链接已复制，快分享给好友吧');
        }}
      >
        <Icon name="share" size={26} />
        <span>{formatCount(stat.share)}</span>
      </button>

      {toast && <div className="action-bar__toast fade-in">{toast}</div>}
    </div>
  );
}

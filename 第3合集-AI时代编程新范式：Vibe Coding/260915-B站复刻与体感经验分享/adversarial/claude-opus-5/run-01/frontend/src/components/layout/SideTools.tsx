import { useEffect, useState } from 'react';
import { Icon } from '../common/Icon';
import './SideTools.css';

/** 右下角悬浮工具条：回到顶部 / 反馈 / 客服（与 B 站一致的位置与交互） */
export function SideTools() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="side-tools">
      <button className="side-tools__btn" title="客服">
        <Icon name="message" size={18} />
        <span>客服</span>
      </button>
      <button className="side-tools__btn" title="反馈">
        <Icon name="reply" size={18} />
        <span>反馈</span>
      </button>
      <button
        className={`side-tools__btn side-tools__btn--top ${visible ? 'is-visible' : ''}`}
        title="回到顶部"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Icon name="top" size={18} />
        <span>顶部</span>
      </button>
    </div>
  );
}

/** 右下角悬浮工具条：客服 / 反馈 / 回顶部（滚动一定距离后出现）。 */
import { useEffect, useState } from 'react';
import { Icon } from '../common/Icon';
import './side-toolbar.css';

export function SideToolbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="side-toolbar">
      <button className="side-toolbar__btn" title="客服">
        <Icon name="comment" size={18} />
        <span>客服</span>
      </button>
      <button className="side-toolbar__btn" title="反馈">
        <Icon name="dynamic" size={18} />
        <span>反馈</span>
      </button>
      <button
        className={`side-toolbar__btn side-toolbar__top ${visible ? 'is-visible' : ''}`}
        title="回顶部"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Icon name="top" size={18} />
        <span>顶部</span>
      </button>
    </div>
  );
}

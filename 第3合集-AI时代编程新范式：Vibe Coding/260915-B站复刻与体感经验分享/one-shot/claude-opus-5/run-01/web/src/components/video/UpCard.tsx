/** 播放页右侧 UP 主卡片：头像、粉丝数、关注按钮、发消息。 */
import { useState } from 'react';
import { Icon } from '../common/Icon';
import { formatCount } from '../../utils/format';
import type { UpBrief } from '../../types';
import './up-card.css';

interface Props {
  up: UpBrief;
  channelName: string;
}

export function UpCard({ up, channelName }: Props) {
  const [followed, setFollowed] = useState(false);

  return (
    <section className="up-card">
      <div className="up-card__head">
        <div className="up-card__avatar">
          <img src={up.avatar} alt={up.name} />
          <i className="up-card__badge">UP</i>
        </div>
        <div className="up-card__info">
          <div className="up-card__name">{up.name}</div>
          <div className="up-card__sub">
            {formatCount(up.followers)} 粉丝 · {channelName}区 UP 主
          </div>
        </div>
      </div>

      <div className="up-card__actions">
        <button
          className={`up-card__follow ${followed ? 'is-followed' : ''}`}
          onClick={() => setFollowed((v) => !v)}
        >
          {followed ? '已关注' : '+ 关注'}
        </button>
        <button className="up-card__message">
          <Icon name="comment" size={14} /> 发消息
        </button>
      </div>
    </section>
  );
}

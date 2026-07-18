import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {
  const bvid = video.bvid || video.bvid;
  const cover = video.pic || video.cover;
  const title = video.title;
  const owner = video.owner?.name || video.author || '未知 UP 主';
  const play = video.stat?.view || video.play || 0;
  const danmaku = video.stat?.danmaku || video.video_review || 0;

  function formatNum(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  }

  return (
    <Link to={`/video/${bvid}`} className="block">
      <div className="bili-card group">
        <div className="relative overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex items-center text-white text-xs space-x-3">
              <span>▶ {formatNum(play)}</span>
              <span>💬 {formatNum(danmaku)}</span>
            </div>
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm text-bili-text line-clamp-2 mb-2 group-hover:text-bili-pink transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-xs text-bili-gray-text">
            <span className="w-5 h-5 rounded-full bg-bili-pink text-white flex items-center justify-center mr-2">
              {owner[0]}
            </span>
            <span>{owner}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

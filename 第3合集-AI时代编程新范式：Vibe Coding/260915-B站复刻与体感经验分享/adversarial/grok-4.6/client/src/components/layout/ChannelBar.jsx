import { Link, useParams } from 'react-router-dom'

export default function ChannelBar({ meta }) {
  const { id } = useParams()
  const channels = meta?.channels || []
  const extras = meta?.extras || []
  return (
    <div className="channel-bar">
      <div className="channel-icons">
        <Link className="icon-btn" to="/?tab=dynamic">
          <div className="icon-circle dynamic">动</div>
          动态
        </Link>
        <Link className="icon-btn" to="/channel/hot">
          <div className="icon-circle hot">热</div>
          热门
        </Link>
      </div>
      <div className="channel-grid">
        {channels.slice(0, 21).map((ch) => (
          <Link
            key={ch.id}
            className={`channel-chip ${id === ch.id ? 'active' : ''}`}
            to={`/channel/${ch.id}`}
          >
            {ch.name}
          </Link>
        ))}
        <div className="channel-chip channel-more">
          更多
          <div className="mini-menu">
            {(meta?.extraChannels || []).map((ch) => (
              <Link key={ch.id} to={`/channel/${ch.id}`}>{ch.name}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="channel-extras">
        {extras.map((item) => (
          <Link key={item.id} className="extra-item" to={item.id === 'live' ? '/channel/ent' : '/'}>
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

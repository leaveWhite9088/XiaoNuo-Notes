const ITEMS = [
  { icon: '🏠', label: '首页' },
  { icon: '⭐', label: '精选' },
  { icon: '🔥', label: '热门' },
  { icon: '📺', label: '追番' },
  { icon: '🎮', label: '游戏中心' },
  { icon: '🎵', label: '音乐' },
  { icon: '🎬', label: '放映厅' },
  { icon: '📚', label: '课堂' },
  { icon: '🏆', label: '排行榜' },
  { icon: '🕘', label: '历史记录' },
  { icon: '⏰', label: '稍后再看' },
]

export default function Sidebar({ open, onNavigate }) {
  return (
    <nav className={`sidebar ${open ? 'open' : ''}`}>
      {ITEMS.map((item, i) => (
        <button
          key={item.label}
          className={`side-item ${i === 0 ? 'active' : ''}`}
          title={item.label}
          onClick={onNavigate}
        >
          <span className="side-icon">{item.icon}</span>
          <span className="side-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

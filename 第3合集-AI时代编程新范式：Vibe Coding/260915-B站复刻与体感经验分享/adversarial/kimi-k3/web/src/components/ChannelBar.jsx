export default function ChannelBar({ categories, active, onSelect }) {
  return (
    <div className="channel-bar">
      {categories.map((c) => (
        <button
          key={c}
          className={`channel-chip ${active === c ? 'active' : ''}`}
          onClick={() => onSelect(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

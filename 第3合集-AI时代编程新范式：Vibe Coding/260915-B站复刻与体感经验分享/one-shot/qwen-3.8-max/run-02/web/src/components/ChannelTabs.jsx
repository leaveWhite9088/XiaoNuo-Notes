export default function ChannelTabs({ categories, active, onChange, onRefresh }) {
  return (
    <div className="channel-tabs">
      <div className="channel-list">
        {categories.map((c) => (
          <button
            key={c}
            className={`channel-tab ${active === c ? 'active' : ''}`}
            onClick={() => onChange(c)}
            type="button"
          >
            {c}
          </button>
        ))}
      </div>
      <button className="refresh-btn" onClick={onRefresh} type="button" title="换一换推荐内容">
        <span className="refresh-icon">⟳</span> 换一换
      </button>
    </div>
  );
}

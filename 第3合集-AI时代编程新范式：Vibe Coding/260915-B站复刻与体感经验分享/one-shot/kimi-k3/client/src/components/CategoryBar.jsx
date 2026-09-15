export default function CategoryBar({ categories, current, onChange }) {
  return (
    <div className="category-bar">
      {categories.map((c) => (
        <button
          key={c}
          className={`category-tab ${c === current ? 'on' : ''}`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

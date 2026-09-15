import type { Category } from '../types';

export default function CategoryBar({
  cats,
  active,
  onPick,
}: {
  cats: Category[];
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="category-bar">
      {cats.map((c) => (
        <button key={c.id} className={`chip ${active === c.id ? 'chip-active' : ''}`} onClick={() => onPick(c.id)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}

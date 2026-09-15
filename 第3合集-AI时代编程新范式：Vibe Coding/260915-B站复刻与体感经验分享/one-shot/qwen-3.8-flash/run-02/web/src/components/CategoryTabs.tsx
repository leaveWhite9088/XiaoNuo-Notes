import { Category } from "../api/client";

/** 分类筛选标签行（数据来自后端真实分区统计） */
export default function CategoryTabs({ cats, tid, onChange }: {
  cats: Category[]; tid: number; onChange: (t: number) => void;
}) {
  const tab = (active: boolean, key: number, name: string, count?: number) => (
    <button
      key={key}
      className={"cat-tab" + (active ? " active" : "")}
      onClick={() => onChange(key)}
    >
      {name}
      {count !== undefined && <span className="cat-count">{count}</span>}
    </button>
  );
  return (
    <div className="cat-tabs">
      {tab(tid === 0, 0, "全部")}
      {cats.slice(0, 16).map((c) => tab(tid === c.tid, c.tid, c.name, c.count))}
    </div>
  );
}

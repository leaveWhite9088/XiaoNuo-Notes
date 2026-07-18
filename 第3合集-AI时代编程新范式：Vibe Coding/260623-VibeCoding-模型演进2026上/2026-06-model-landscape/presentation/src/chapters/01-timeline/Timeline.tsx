import type { ChapterStepProps } from "../../registry/types";
import "./Timeline.css";

/* ── brand colors (same as benchmark chapter) ── */
const C = {
  anthropic: "#D4845E",
  openai: "#10A37F",
  google: "#4285F4",
  deepseek: "#4D6BFE",
  glm: "#3366FF",
  kimi: "#7C3AED",
  qwen: "#6D28D9",
  minimax: "#E8453C",
  doubao: "#1BA4A4",
  xiaomi: "#FF6900",
  stepfun: "#E05A9C",
  mistral: "#FF7000",
  neutral: "#888888",
} as const;

/* ── helper: event card ── */
interface EventData {
  date: string;
  day?: number;
  logo: string;
  text: string;
  detail?: string;
  color: string;
  type?: "model" | "news";
  banned?: boolean;
  counter?: boolean;
}

function EventCard({ ev }: { ev: EventData }) {
  const isNews = ev.type === "news";
  const cls = [
    "tl-event",
    isNews ? "tl-event--news" : "",
    ev.banned ? "tl-event--banned" : "",
    ev.counter ? "tl-event--counter" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} style={{ "--ev-color": ev.color } as React.CSSProperties}>
      <span className="tl-event-date" style={isNews ? { background: "transparent", color: ev.color, border: `1px solid ${ev.color}` } : { background: ev.color }}>{ev.date}</span>
      <img className="tl-event-logo" src={`/logos/${ev.logo}`} alt="" />
      <span className="tl-event-text">{ev.text}</span>
      {ev.detail && <span className="tl-event-detail">{ev.detail}</span>}
      {ev.banned && <span className="tl-banned-stamp">Banned</span>}
    </div>
  );
}

/* ── mini calendar ── */
interface CalEvent { day: number; color: string }

function MiniCalendar({ month, events }: { month: number; events: CalEvent[] }) {
  const firstDay = new Date(2026, month - 1, 1).getDay();
  const daysInMonth = new Date(2026, month, 0).getDate();
  const colorMap = new Map<number, string>();
  for (const e of events) colorMap.set(e.day, e.color);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<span key={`pad-${i}`} className="tl-cal-cell tl-cal-pad" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const c = colorMap.get(d);
    cells.push(
      <span
        key={d}
        className={`tl-cal-cell${c ? " tl-cal-active" : ""}`}
        style={c ? { "--cal-color": c } as React.CSSProperties : undefined}
      >
        {d}
      </span>
    );
  }

  return (
    <div className="tl-cal">
      <div className="tl-cal-head">
        {"日一二三四五六".split("").map((d, i) => (
          <span key={i} className="tl-cal-dow">{d}</span>
        ))}
      </div>
      <div className="tl-cal-grid">{cells}</div>
    </div>
  );
}

/* ── month header ── */
function MonthHeader({
  monthEn,
  monthNum,
  subtitle,
  month,
  calEvents,
  children,
}: {
  monthEn: string;
  monthNum: string;
  subtitle: string;
  month: number;
  calEvents: CalEvent[];
  children?: React.ReactNode;
}) {
  return (
    <div className="tl-month-header">
      <span className="tl-month-label">{monthNum} 2026</span>
      <span className="tl-month-name">{monthEn}</span>
      <span className="tl-month-subtitle">{subtitle}</span>
      {children}
      <MiniCalendar month={month} events={calEvents} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 * Timeline chapter — 7 steps (0..6)
 * ════════════════════════════════════════════════════════════════════ */
export default function Timeline({ step }: ChapterStepProps) {
  /* ── Step 0: Title page ── */
  if (step === 0) {
    return (
      <div className="scene" key={step}>
        <div className="tl-title-page">
          <hr className="tl-title-rule" />
          <h1 className="tl-title-main">
            2026 上半年
            <br />
            AI 模型发布全景
          </h1>
          <p className="tl-title-sub">
            6 个月 <span>&middot;</span> 30+ 模型 <span>&middot;</span>{" "}
            一场大混战
          </p>
        </div>
      </div>
    );
  }

  /* ── Step 1: January ── */
  if (step === 1) {
    const events: EventData[] = [
      { date: "1/15", day: 15, logo: "OpenAI.png", text: "Go Plan $8/月 全球上线", detail: "广告补贴模式 · 98 国可用", color: C.openai, type: "news" },
      { date: "1/27", day: 27, logo: "kimi.png", text: "Kimi K2.5 发布", detail: "1T MoE 开源 · 后被 Cursor 选为基座", color: C.kimi },
    ];
    return (
      <div className="scene" key={step}>
        <div className="tl-month-page">
          <MonthHeader monthEn="Jan" monthNum="01" subtitle="蓄势待发" month={1}
            calEvents={events.filter(e => e.day).map(e => ({ day: e.day!, color: e.color }))}
          />
          <div className="tl-events tl-events--sparse">
            {events.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2: February ── */
  if (step === 2) {
    const events: EventData[] = [
      { date: "2/2", day: 2, logo: "stepfun.png", text: "Step 3.5 Flash 发布", detail: "阶跃星辰 · 推理模型", color: C.stepfun },
      { date: "2/5", day: 5, logo: "anthropic.png", text: "Opus 4.6 发布，降价 67%", detail: "$15/$75 → $5/$25 · 1M context", color: C.anthropic },
      { date: "2/9", day: 9, logo: "OpenAI.png", text: "Free 用户开始看广告", detail: "Go Plan 广告补贴策略落地", color: C.openai, type: "news" },
      { date: "2/11", day: 11, logo: "glm.png", text: "GLM-5 发布", detail: "港股周涨 70%", color: C.glm },
      { date: "2/14", day: 14, logo: "doubao.png", text: "豆包 Seed 2.0 Pro 发布", detail: "HLE-Text 54.2% — 后被质疑数据注水", color: C.doubao },
      { date: "2/16", day: 16, logo: "Qwen.png", text: "Qwen3.5 发布（除夕）", detail: "春节期间上线", color: C.qwen },
      { date: "2/17", day: 17, logo: "anthropic.png", text: "Claude Sonnet 4.6 发布", detail: "中端主力 · $3/$15 · 接近 Opus 水平", color: C.anthropic },
      { date: "2/19", day: 19, logo: "gemini.png", text: "Gemini 3.1 Pro 发布", detail: "推理能力比 3 Pro 翻倍 · $2/$12", color: C.google },
    ];
    return (
      <div className="scene" key={step}>
        <div className="tl-month-page">
          <MonthHeader monthEn="Feb" monthNum="02" subtitle="春节档大混战" month={2}
            calEvents={events.filter(e => e.day).map(e => ({ day: e.day!, color: e.color }))}
          />
          <div className="tl-events tl-events--dense">
            {events.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 3: March ── */
  if (step === 3) {
    const events: EventData[] = [
      { date: "3/5", day: 5, logo: "OpenAI.png", text: "GPT-5.4 发布", detail: "$2.50/$15 · 中档主力", color: C.openai },
      { date: "3/16", day: 16, logo: "mistral.png", text: "Mistral Small 4 开源", detail: "Apache 2.0 · 119B MoE", color: C.mistral },
      { date: "3/18", day: 18, logo: "xiaomi.png", text: "MiMo-V2-Pro 发布", detail: "小米入局 AI 模型", color: C.xiaomi },
      { date: "3/18", day: 18, logo: "minimax.png", text: "MiniMax M2.7 发布", detail: "文本能力升级", color: C.minimax },
      { date: "3 月", logo: "kimi.png", text: "K2.5 被 Cursor 选为基座", detail: "博客全文不提 → 'It was a miss'", color: C.kimi, type: "news" },
      { date: "3/23", day: 23, logo: "anthropic.png", text: "Claude Code 限额风波", detail: "'19 分钟花光 20x 额度'", color: C.anthropic, type: "news" },
    ];
    return (
      <div className="scene" key={step}>
        <div className="tl-month-page">
          <MonthHeader monthEn="Mar" monthNum="03" subtitle="暗流涌动" month={3}
            calEvents={events.filter(e => e.day).map(e => ({ day: e.day!, color: e.color }))}
          />
          <div className="tl-events">
            {events.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 4: April ── */
  if (step === 4) {
    const events: EventData[] = [
      { date: "4/2", day: 2, logo: "Qwen.png", text: "Qwen3.6-Plus 发布", detail: "24h 破 1.4 万亿 token", color: C.qwen },
      { date: "4/2", day: 2, logo: "OpenAI.png", text: "Codex 转 token 计费", color: C.openai, type: "news" },
      { date: "4/8", day: 8, logo: "glm.png", text: "GLM-5.1 — SWE-bench Pro 开源第一", detail: "58.4% · 首个开源进前三", color: C.glm },
      { date: "4/9", day: 9, logo: "OpenAI.png", text: "Pro $100 档新增", color: C.openai, type: "news" },
      { date: "4/16", day: 16, logo: "anthropic.png", text: "Opus 4.7 — 新 tokenizer", detail: "变相涨价 +35%", color: C.anthropic },
      { date: "4/20", day: 20, logo: "kimi.png", text: "K2.6 — 300 子 Agent / 4000 步", color: C.kimi },
      { date: "4/23", day: 23, logo: "OpenAI.png", text: "GPT-5.5 · $5/$30 输出价翻倍", detail: "Terminal-Bench 82.7%", color: C.openai },
      { date: "4/24", day: 24, logo: "DeepSeek.png", text: "V4 Preview — 1/10 价格杀入", detail: "$0.87 vs $30 = 34x 价差", color: C.deepseek },
      { date: "4/28", day: 28, logo: "xiaomi.png", text: "MiMo-V2.5 MIT 开源", detail: "推理模型开源", color: C.xiaomi },
    ];
    return (
      <div className="scene" key={step}>
        <div className="tl-month-page">
          <MonthHeader monthEn="Apr" monthNum="04" subtitle="48 小时三连爆" month={4}
            calEvents={events.filter(e => e.day).map(e => ({ day: e.day!, color: e.color }))}
          >
            <span className="tl-dense-label">9 events in 4 weeks</span>
          </MonthHeader>
          <div className="tl-events tl-events--dense">
            {events.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 5: May ── */
  if (step === 5) {
    const events: EventData[] = [
      { date: "5/6", day: 6, logo: "anthropic.png", text: "Claude Code 限额翻倍", detail: "5 小时永久翻倍 + 周限额 +50%", color: C.anthropic, type: "news" },
      { date: "5/19", day: 19, logo: "google.png", text: "Google I/O 2026", detail: "Gemini 3.5 Flash · Ultra $250→$100", color: C.google, type: "news" },
      { date: "5/20", day: 20, logo: "Qwen.png", text: "Qwen3.7-Max", detail: "LMArena Elo 1475 · 幻觉率 22.9%", color: C.qwen },
      { date: "5/22", day: 22, logo: "DeepSeek.png", text: "V4-Pro 转永久价", detail: "$0.435/$0.87 — 2.5 折锁定", color: C.deepseek, type: "news" },
      { date: "5/27", day: 27, logo: "xiaomi.png", text: "MiMo V2.5-Pro 降价 99%", color: C.xiaomi, type: "news" },
      { date: "5/28", day: 28, logo: "anthropic.png", text: "Opus 4.8 发布", detail: "AA Index 55.7% 登顶", color: C.anthropic },
    ];
    return (
      <div className="scene" key={step}>
        <div className="tl-month-page">
          <MonthHeader monthEn="May" monthNum="05" subtitle="放量大战" month={5}
            calEvents={events.filter(e => e.day).map(e => ({ day: e.day!, color: e.color }))}
          />
          <div className="tl-events">
            {events.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 6: June ── */
  if (step === 6) {
    const events: EventData[] = [
      { date: "6/1", day: 1, logo: "minimax.png", text: "MiniMax M3 — 原生多模态 + 1M context", color: C.minimax },
      { date: "6/9", day: 9, logo: "anthropic.png", text: "Fable 5 + Mythos 5 发布", detail: "安全过严 — 'cancer' 被标记为生物安全风险", color: C.anthropic },
      { date: "6/12", day: 12, logo: "anthropic.png", text: "美国政府禁令 → Fable 5 全球下架", color: C.anthropic, type: "news", banned: true },
      { date: "6/12", day: 12, logo: "kimi.png", text: "K2.7-Code 发布", detail: "禁令同天", color: C.kimi, counter: true },
      { date: "6/13", day: 13, logo: "glm.png", text: "GLM-5.2 发布 + MIT 开源", detail: "禁令次日 · 24h 超 88 万浏览", color: C.glm, counter: true },
    ];
    return (
      <div className="scene" key={step}>
        <div className="tl-month-page">
          <MonthHeader monthEn="Jun" monthNum="06" subtitle="高潮与黑天鹅" month={6}
            calEvents={events.filter(e => e.day).map(e => ({ day: e.day!, color: e.color }))}
          />
          <div className="tl-events">
            {events.map((ev, i) => <EventCard key={i} ev={ev} />)}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

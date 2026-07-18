import type { ChapterStepProps } from "../../registry/types";
import "./Pricing.css";

/* ── brand colors ── */
const CLR = {
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
} as const;

/* ═══════════════════════════════════════════════════════════════
 * Shared: API table components
 * ═══════════════════════════════════════════════════════════════ */

interface ApiRow {
  model: string;
  logo: string;
  input: string;
  output: string;
  cache: string;
  ctx: string;
  color: string;
}

function ApiTable({ rows, label }: { rows: ApiRow[]; label: string }) {
  return (
    <div className="pr-api-block">
      <div className="pr-api-label">{label}</div>
      <div className="pr-api-table">
        <div className="pr-api-head">
          <span className="pr-api-hcell pr-api-hcell--model">Model</span>
          <span className="pr-api-hcell">Input</span>
          <span className="pr-api-hcell">Output</span>
          <span className="pr-api-hcell">Cache</span>
          <span className="pr-api-hcell">Context</span>
        </div>
        {rows.map((r, i) => (
          <div
            className={`pr-api-row ${i % 2 === 0 ? "pr-api-row--even" : ""}`}
            key={r.model}
            style={{ animationDelay: `${300 + i * 80}ms`, "--row-color": r.color } as React.CSSProperties}
          >
            <span className="pr-api-cell pr-api-cell--model">
              <img className="pr-api-logo" src={`/logos/${r.logo}`} alt="" />
              {r.model}
            </span>
            <span className="pr-api-cell">{r.input}</span>
            <span className="pr-api-cell pr-api-cell--output">{r.output}</span>
            <span className="pr-api-cell pr-api-cell--cache">{r.cache}</span>
            <span className="pr-api-cell pr-api-cell--ctx">{r.ctx}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * Step 0 — Overseas API
 * ═══════════════════════════════════════════════════════════════ */

const OVERSEAS: ApiRow[] = [
  { model: "GPT-5.5 Pro", logo: "OpenAI.png", input: "$30.00", output: "$180.00", cache: "—", ctx: "1.05M", color: CLR.openai },
  { model: "Claude Fable 5", logo: "anthropic.png", input: "$10.00", output: "$50.00", cache: "—", ctx: "BANNED", color: CLR.anthropic },
  { model: "GPT-5.5", logo: "OpenAI.png", input: "$5.00", output: "$30.00", cache: "$0.50", ctx: "1.05M", color: CLR.openai },
  { model: "Claude Opus 4.8", logo: "anthropic.png", input: "$5.00", output: "$25.00", cache: "$0.50", ctx: "1M", color: CLR.anthropic },
  { model: "Claude Opus 4.7", logo: "anthropic.png", input: "$5.00", output: "$25.00", cache: "$0.50", ctx: "1M", color: CLR.anthropic },
  { model: "GPT-5.4", logo: "OpenAI.png", input: "$2.50", output: "$15.00", cache: "$0.25", ctx: "1.1M", color: CLR.openai },
  { model: "Claude Sonnet 4.6", logo: "anthropic.png", input: "$3.00", output: "$15.00", cache: "$0.30", ctx: "1M", color: CLR.anthropic },
  { model: "Gemini 3.1 Pro", logo: "google.png", input: "$2.00", output: "$12.00", cache: "$0.20", ctx: "200K", color: CLR.google },
  { model: "Gemini 3.5 Flash", logo: "google.png", input: "$1.50", output: "$9.00", cache: "$0.15", ctx: "1M", color: CLR.google },
  { model: "Claude Haiku 4.5", logo: "anthropic.png", input: "$1.00", output: "$5.00", cache: "$0.10", ctx: "200K", color: CLR.anthropic },
];

/* ═══════════════════════════════════════════════════════════════
 * Step 1 — Domestic API
 * ═══════════════════════════════════════════════════════════════ */

const DOMESTIC: ApiRow[] = [
  { model: "GLM-5.2", logo: "glm.png", input: "$1.40", output: "$4.40", cache: "$0.26", ctx: "1M", color: CLR.glm },
  { model: "Kimi K2.7", logo: "kimi.png", input: "$0.95", output: "$4.00", cache: "$0.19", ctx: "256K", color: CLR.kimi },
  { model: "Qwen3.7 Max", logo: "Qwen.png", input: "$1.25", output: "$3.75", cache: "—", ctx: "1M", color: CLR.qwen },
  { model: "Doubao Seed 2.0 Pro", logo: "doubao.png", input: "$0.47", output: "$2.37", cache: "—", ctx: "128K", color: CLR.doubao },
  { model: "Qwen3.6 Plus", logo: "Qwen.png", input: "$0.325", output: "$1.95", cache: "—", ctx: "1M", color: CLR.qwen },
  { model: "MiniMax M3", logo: "minimax.png", input: "$0.30", output: "$1.20", cache: "$0.06", ctx: "1M", color: CLR.minimax },
  { model: "MiMo V2.5-Pro", logo: "xiaomi.png", input: "$0.435", output: "$0.87", cache: "$0.004", ctx: "1M", color: CLR.xiaomi },
  { model: "DeepSeek V4-Pro", logo: "DeepSeek.png", input: "$0.435", output: "$0.87", cache: "$0.004", ctx: "1M", color: CLR.deepseek },
  { model: "DeepSeek V4-Flash", logo: "DeepSeek.png", input: "$0.14", output: "$0.28", cache: "$0.003", ctx: "1M", color: CLR.deepseek },
];

/* ═══════════════════════════════════════════════════════════════
 * Step 2 — Subscription Plans
 * ═══════════════════════════════════════════════════════════════ */

interface SubGroup {
  vendor: string;
  logo: string;
  color: string;
  plans: { name: string; price: string; quota: string; note?: string }[];
}

const SUB_GROUPS: SubGroup[] = [
  {
    vendor: "Anthropic", logo: "anthropic.png", color: CLR.anthropic,
    plans: [
      { name: "Pro", price: "$20", quota: "1x" },
      { name: "Max 5x", price: "$100", quota: "5x" },
      { name: "Max 20x", price: "$200", quota: "20x" },
    ],
  },
  {
    vendor: "OpenAI", logo: "OpenAI.png", color: CLR.openai,
    plans: [
      { name: "Go", price: "$8", quota: "10x Free", note: "广告补贴" },
      { name: "Plus", price: "$20", quota: "Standard" },
      { name: "Pro $100", price: "$100", quota: "5x Plus" },
      { name: "Pro $200", price: "$200", quota: "近无限" },
    ],
  },
  {
    vendor: "Google", logo: "google.png", color: CLR.google,
    plans: [
      { name: "AI Plus", price: "$7.99", quota: "2x" },
      { name: "AI Pro", price: "$19.99", quota: "4x" },
      { name: "Ultra $100", price: "$100", quota: "5x Pro" },
      { name: "Ultra $200", price: "$200", quota: "20x Pro" },
    ],
  },
  {
    vendor: "智谱", logo: "glm.png", color: CLR.glm,
    plans: [
      { name: "Lite", price: "¥49", quota: "~80次/5h" },
      { name: "Pro", price: "¥149", quota: "~400次/5h" },
      { name: "Max", price: "¥469", quota: "~1600次/5h", note: "3x 消耗" },
    ],
  },
  {
    vendor: "Kimi", logo: "kimi.png", color: CLR.kimi,
    plans: [
      { name: "Andante", price: "¥49", quota: "1x" },
      { name: "Moderato", price: "¥99", quota: "4x" },
      { name: "Allegretto", price: "¥199", quota: "20x" },
      { name: "Allegro", price: "¥699", quota: "60x" },
    ],
  },
  {
    vendor: "MiniMax", logo: "minimax.png", color: CLR.minimax,
    plans: [
      { name: "Starter", price: "¥29", quota: "基础" },
      { name: "Plus", price: "¥49", quota: "中等" },
      { name: "Max", price: "¥119", quota: "全模态" },
    ],
  },
  {
    vendor: "DeepSeek", logo: "DeepSeek.png", color: CLR.deepseek,
    plans: [
      { name: "Web/App", price: "免费", quota: "无限对话" },
      { name: "API", price: "按量", quota: "无订阅制", note: "$0.14~$0.87/M" },
    ],
  },
  {
    vendor: "豆包", logo: "doubao.png", color: CLR.doubao,
    plans: [
      { name: "Standard", price: "¥68", quota: "轻度" },
      { name: "Enhanced", price: "¥200", quota: "中等" },
      { name: "Professional", price: "¥500", quota: "企业级" },
    ],
  },
  {
    vendor: "MiMo", logo: "xiaomi.png", color: CLR.xiaomi,
    plans: [
      { name: "Lite", price: "¥39", quota: "41亿 tkn", note: "降价 68x" },
      { name: "Premium", price: "¥659", quota: "820亿" },
    ],
  },
];

function SubGrid() {
  return (
    <div className="pr-sub-grid">
      {SUB_GROUPS.map((g, gi) => (
        <div
          key={g.vendor}
          className="pr-sub-card"
          style={{ "--sub-color": g.color, animationDelay: `${200 + gi * 80}ms` } as React.CSSProperties}
        >
          <div className="pr-sub-card-head">
            <img className="pr-sub-card-logo" src={`/logos/${g.logo}`} alt="" />
            <span className="pr-sub-card-vendor">{g.vendor}</span>
          </div>
          <div className="pr-sub-card-plans">
            {g.plans.map((p) => (
              <div key={p.name} className="pr-sub-plan-row">
                <span className="pr-sub-plan-name">{p.name}</span>
                <span className="pr-sub-plan-price">{p.price}</span>
                <span className="pr-sub-plan-quota">{p.quota}</span>
                {p.note && <span className="pr-sub-plan-note">{p.note}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * Step 3 — Vendor Speed-Review with Word Clouds
 * ═══════════════════════════════════════════════════════════════ */

interface VendorReview {
  name: string;
  logo: string;
  color: string;
  words: { text: string; size: number }[];
}

const REVIEWS: VendorReview[] = [
  {
    name: "Anthropic", logo: "anthropic.png", color: CLR.anthropic,
    words: [
      { text: "最强编码", size: 28 }, { text: "限额地狱", size: 26 },
      { text: "Misanthropic", size: 22 }, { text: "19分钟花光", size: 20 },
      { text: "涨价35%", size: 18 }, { text: "封禁严苛", size: 16 },
      { text: "1M上下文", size: 15 }, { text: "中文倒退", size: 17 },
    ],
  },
  {
    name: "OpenAI", logo: "OpenAI.png", color: CLR.openai,
    words: [
      { text: "最博学", size: 28 }, { text: "不会说不知道", size: 24 },
      { text: "输出价翻倍", size: 20 }, { text: "幻觉86%", size: 22 },
      { text: "Codex转计费", size: 16 }, { text: "推理最深", size: 18 },
      { text: "AI味重", size: 15 }, { text: "广告补贴", size: 17 },
    ],
  },
  {
    name: "Google", logo: "google.png", color: CLR.google,
    words: [
      { text: "左手放价", size: 26 }, { text: "右手收量", size: 26 },
      { text: "静默降级", size: 24 }, { text: "情绪价值", size: 20 },
      { text: "I/O重构", size: 18 }, { text: "前端强", size: 16 },
      { text: "逻辑弱", size: 17 }, { text: "全模态", size: 15 },
    ],
  },
  {
    name: "DeepSeek", logo: "DeepSeek.png", color: CLR.deepseek,
    words: [
      { text: "价格屠夫", size: 28 }, { text: "幻觉94%", size: 24 },
      { text: "best value", size: 22 }, { text: "R2失踪", size: 20 },
      { text: "开源", size: 18 }, { text: "降智争议", size: 17 },
      { text: "not best coder", size: 16 }, { text: "核心流失", size: 15 },
    ],
  },
  {
    name: "智谱 GLM", logo: "glm.png", color: CLR.glm,
    words: [
      { text: "最强开源", size: 28 }, { text: "护照税", size: 24 },
      { text: "3x消耗", size: 22 }, { text: "进步最大", size: 20 },
      { text: "SWE第一", size: 18 }, { text: "难抢", size: 16 },
      { text: "MIT开源", size: 17 }, { text: "思维链慢", size: 15 },
    ],
  },
  {
    name: "Kimi", logo: "kimi.png", color: CLR.kimi,
    words: [
      { text: "Cursor偷家", size: 26 }, { text: "替代不了Claude", size: 22 },
      { text: "It was a miss", size: 20 }, { text: "MCP强", size: 18 },
      { text: "自报benchmark", size: 16 }, { text: "K2.7-Code", size: 15 },
      { text: "计费不友好", size: 17 }, { text: "专注coding", size: 19 },
    ],
  },
  {
    name: "MiniMax", logo: "minimax.png", color: CLR.minimax,
    words: [
      { text: "偏科补齐", size: 26 }, { text: "全模态", size: 22 },
      { text: "Token Plan", size: 20 }, { text: "认知度低", size: 18 },
      { text: "1M上下文", size: 16 }, { text: "前端强", size: 17 },
    ],
  },
  {
    name: "Qwen", logo: "Qwen.png", color: CLR.qwen,
    words: [
      { text: "最诚实", size: 28 }, { text: "幻觉最低", size: 24 },
      { text: "算力涨价", size: 20 }, { text: "千倍差价", size: 18 },
      { text: "开源无敌", size: 22 }, { text: "大模型弱", size: 16 },
    ],
  },
  {
    name: "豆包", logo: "doubao.png", color: CLR.doubao,
    words: [
      { text: "烧不起了", size: 26 }, { text: "HLE存疑", size: 24 },
      { text: "转付费", size: 22 }, { text: "视觉Top4", size: 18 },
      { text: "无人编程用", size: 16 }, { text: "数据注水", size: 20 },
    ],
  },
];

function WordCloud({ words, color }: { words: { text: string; size: number }[]; color: string }) {
  return (
    <div className="pr-wc">
      {words.map((w, i) => (
        <span
          key={i}
          className="pr-wc-word"
          style={{
            fontSize: `${w.size}px`,
            color,
            opacity: 0.4 + (w.size / 28) * 0.6,
            animationDelay: `${400 + i * 100}ms`,
          }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}

function VendorGrid() {
  return (
    <div className="pr-vendor-grid">
      {REVIEWS.map((v, i) => (
        <div
          className="pr-vendor-card"
          key={v.name}
          style={{ animationDelay: `${200 + i * 80}ms`, "--vendor-color": v.color } as React.CSSProperties}
        >
          <div className="pr-vendor-head">
            <img className="pr-vendor-logo" src={`/logos/${v.logo}`} alt="" />
            <span className="pr-vendor-name">{v.name}</span>
          </div>
          <WordCloud words={v.words} color={v.color} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * Step 4 — Trends
 * ═══════════════════════════════════════════════════════════════ */

interface TrendCard {
  num: string;
  label: string;
  desc: string;
}

const TRENDS: TrendCard[] = [
  { num: "642x", label: "API 价差", desc: "GPT-5.5 Pro $180 vs V4-Flash $0.28" },
  { num: "隐性涨价", label: "成常态", desc: "tokenizer 膨胀 / 输出价翻倍 / 静默限额收紧" },
  { num: "5h", label: "滚动窗口", desc: "Anthropic / Google / 智谱 / Kimi 均采用" },
  { num: "1.2 亿", label: "单 Agent/h", desc: "Agent 推高实际成本 — 理论低价实践爆炸" },
];

function TrendGrid() {
  return (
    <div className="pr-trend-grid">
      {TRENDS.map((t, i) => (
        <div
          className="pr-trend-card"
          key={t.label}
          style={{ animationDelay: `${300 + i * 200}ms` }}
        >
          <span className="pr-trend-num">{t.num}</span>
          <span className="pr-trend-label">{t.label}</span>
          <span className="pr-trend-desc">{t.desc}</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
 * Chapter component — 5 steps (0..4)
 * ════════════════════════════════════════════════════════════════ */
export default function Pricing({ step }: ChapterStepProps) {
  if (step === 0) {
    return (
      <div className="scene" key={step}>
        <div className="pr-api-page">
          <h1 className="pr-chapter-title">定价策略</h1>
          <p className="pr-chapter-sub">API Pricing &middot; $/1M tokens &middot; Output descending</p>
          <ApiTable rows={OVERSEAS} label="Overseas — 海外厂商" />
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="scene" key={step}>
        <div className="pr-api-page">
          <h2 className="pr-section-title">国产模型 API 定价</h2>
          <p className="pr-chapter-sub">Domestic &middot; $/1M tokens &middot; Output descending</p>
          <ApiTable rows={DOMESTIC} label="Domestic — 国产厂商" />
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="scene" key={step}>
        <div className="pr-sub-page">
          <h2 className="pr-section-title" style={{ fontSize: 40, marginBottom: 2 }}>订阅 / Token Plan / Coding Plan</h2>
          <p className="pr-chapter-sub" style={{ marginBottom: 12 }}>Subscription Plans &middot; Monthly</p>
          <SubGrid />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="scene" key={step}>
        <div className="pr-vendor-page">
          <h2 className="pr-section-title">各家速评</h2>
          <p className="pr-chapter-sub">Vendor Profiles &middot; Community Keywords</p>
          <VendorGrid />
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="scene" key={step}>
        <div className="pr-trend-page">
          <h2 className="pr-section-title">四个趋势</h2>
          <hr className="pr-trend-rule rule" />
          <TrendGrid />
        </div>
      </div>
    );
  }

  return null;
}

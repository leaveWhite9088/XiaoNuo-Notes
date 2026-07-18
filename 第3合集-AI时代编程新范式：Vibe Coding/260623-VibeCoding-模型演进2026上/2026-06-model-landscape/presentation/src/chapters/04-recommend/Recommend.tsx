import type { ChapterStepProps } from "../../registry/types";
import "./Recommend.css";

const BRAND = {
  anthropic: "#D4845E",
  openai: "#10A37F",
  google: "#4285F4",
  deepseek: "#4D6BFE",
  glm: "#3366FF",
  kimi: "#7C3AED",
  qwen: "#6D28D9",
  minimax: "#E8453C",
  doubao: "#1BA4A4",
} as const;

/* ═══ Step 0 — Title ═══ */
function StepTitle({ step }: ChapterStepProps) {
  return (
    <div className="rc-title-page" key={step}>
      <h1 className="rc-title">使用推荐</h1>
      <p className="rc-subtitle">No Best Model — Only Best Fit</p>
    </div>
  );
}

/* ═══ Step 1 — 日常中文聊天/办公 ═══ */
function StepDaily({ step }: ChapterStepProps) {
  const cards = [
    {
      name: "Kimi K2.7",
      logo: "kimi.png",
      color: BRAND.kimi,
      reason: "中文体感好，MCP 工具调用能力强，适合知识整理和多轮对话",
      metrics: [{ label: "256K 上下文", val: "" }, { label: "MCP 生态", val: "领先" }],
    },
    {
      name: "豆包",
      logo: "doubao.png",
      color: BRAND.doubao,
      reason: "语音交互最自然，多模态体验好，日常问答响应快",
      metrics: [{ label: "语音", val: "最佳" }, { label: "月费", val: "¥68 起" }],
    },
    {
      name: "通义千问",
      logo: "Qwen.png",
      color: BRAND.qwen,
      reason: "数据分析内置代码解释器，文档处理能力强",
      metrics: [{ label: "代码解释器", val: "内置" }, { label: "开源", val: "全系列" }],
    },
    {
      name: "Gemini",
      logo: "gemini.png",
      color: BRAND.google,
      reason: "海外用户首选，情绪价值拉满，1M 上下文处理长文档",
      metrics: [{ label: "上下文", val: "1M" }, { label: "免费额度", val: "充足" }],
    },
  ];

  return (
    <div className="rc-scene-page" key={step}>
      <div className="rc-scene-head">
        <h2 className="rc-scene-title">日常中文聊天 / 办公</h2>
        <span className="rc-scene-tag">SCENARIO 1</span>
      </div>
      <div className="rc-scene-body">
        {cards.map((c, i) => (
          <div
            key={c.name}
            className="rc-card"
            style={{ "--rc-color": c.color, animationDelay: `${200 + i * 120}ms` } as React.CSSProperties}
          >
            <div className="rc-card-left">
              <img className="rc-card-logo" src={`/logos/${c.logo}`} alt="" />
            </div>
            <div className="rc-card-body">
              <div className="rc-card-name">{c.name}</div>
              <div className="rc-card-reason">{c.reason}</div>
            </div>
            <div className="rc-card-right">
              {c.metrics.map((m) => (
                <div key={m.label} className="rc-card-metric">
                  {m.label} {m.val && <b>{m.val}</b>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Step 2 — 大规模开发（成本敏感）═══ */
function StepCostDev({ step }: ChapterStepProps) {
  const cards = [
    {
      name: "DeepSeek V4",
      logo: "DeepSeek.png",
      color: BRAND.deepseek,
      reason: "Flash $0.28 跑重复流量，Pro $0.87 跑难题，整套成本可控在 $40/月内",
      metrics: [{ label: "Flash 输出", val: "$0.28" }, { label: "Pro 输出", val: "$0.87" }],
    },
    {
      name: "Hermes (开源 Agent)",
      logo: "DeepSeek.png",
      color: BRAND.deepseek,
      reason: "开源免费 Agent 框架，直接接 DeepSeek API，无订阅费",
      metrics: [{ label: "费用", val: "免费" }, { label: "API", val: "自选" }],
    },
    {
      name: "GLM-5.2 / MiMo",
      logo: "glm.png",
      color: BRAND.glm,
      reason: "GLM 开源可自部署，MiMo 降价后与 V4-Pro 同价",
      metrics: [{ label: "MiMo 输出", val: "$0.87" }, { label: "GLM", val: "开源" }],
    },
    {
      name: "Cursor Pro",
      logo: "OpenAI.png",
      color: BRAND.openai,
      reason: "月费 $20 即可用，对个人开发者性价比最高的 IDE 方案",
      metrics: [{ label: "月费", val: "$20" }, { label: "模式", val: "订阅制" }],
    },
  ];

  return (
    <div className="rc-scene-page" key={step}>
      <div className="rc-scene-head">
        <h2 className="rc-scene-title">大规模开发（成本敏感）</h2>
        <span className="rc-scene-tag">SCENARIO 2</span>
      </div>
      <div className="rc-scene-body">
        {cards.map((c, i) => (
          <div
            key={c.name}
            className="rc-card"
            style={{ "--rc-color": c.color, animationDelay: `${200 + i * 120}ms` } as React.CSSProperties}
          >
            <div className="rc-card-left">
              <img className="rc-card-logo" src={`/logos/${c.logo}`} alt="" />
            </div>
            <div className="rc-card-body">
              <div className="rc-card-name">{c.name}</div>
              <div className="rc-card-reason">{c.reason}</div>
            </div>
            <div className="rc-card-right">
              {c.metrics.map((m) => (
                <div key={m.label} className="rc-card-metric">
                  {m.label} {m.val && <b>{m.val}</b>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Step 3 — 大规模开发（质量敏感）═══ */
function StepQualityDev({ step }: ChapterStepProps) {
  const cards = [
    {
      name: "Claude Opus 4.8 + Claude Code",
      logo: "anthropic.png",
      color: BRAND.anthropic,
      reason: "编码质量断层第一，Claude Code Max $200/月，复杂重构效率翻倍",
      metrics: [{ label: "SWE-bench", val: "72.7%" }, { label: "Max 月费", val: "$200" }],
    },
    {
      name: "GPT-5.5 + Codex CLI",
      logo: "OpenAI.png",
      color: BRAND.openai,
      reason: "Terminal-Bench 82.7%，Codex 异步执行适合批量任务",
      metrics: [{ label: "Terminal", val: "82.7%" }, { label: "Pro 月费", val: "$200" }],
    },
    {
      name: "OpenClaw / Kimi Claw",
      logo: "kimi.png",
      color: BRAND.kimi,
      reason: "OpenClaw 开源自部署，Kimi Claw 浏览器直接用，Agent 新选择",
      metrics: [{ label: "OpenClaw", val: "开源" }, { label: "Kimi Claw", val: "在线" }],
    },
    {
      name: "最佳实践组合",
      logo: "anthropic.png",
      color: BRAND.anthropic,
      reason: "Cursor 写日常代码 + Claude Code 做重构，月成本 $40–$220",
      metrics: [{ label: "日常", val: "Cursor" }, { label: "重构", val: "Claude Code" }],
    },
  ];

  return (
    <div className="rc-scene-page" key={step}>
      <div className="rc-scene-head">
        <h2 className="rc-scene-title">大规模开发（质量敏感）</h2>
        <span className="rc-scene-tag">SCENARIO 3</span>
      </div>
      <div className="rc-scene-body">
        {cards.map((c, i) => (
          <div
            key={c.name}
            className="rc-card"
            style={{ "--rc-color": c.color, animationDelay: `${200 + i * 120}ms` } as React.CSSProperties}
          >
            <div className="rc-card-left">
              <img className="rc-card-logo" src={`/logos/${c.logo}`} alt="" />
            </div>
            <div className="rc-card-body">
              <div className="rc-card-name">{c.name}</div>
              <div className="rc-card-reason">{c.reason}</div>
            </div>
            <div className="rc-card-right">
              {c.metrics.map((m) => (
                <div key={m.label} className="rc-card-metric">
                  {m.label} {m.val && <b>{m.val}</b>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Step 4 — 厂商专长速查 ═══ */

interface VendorSummary {
  name: string;
  logo: string;
  color: string;
  strengths: string[];
  weakness: string;
}

const VENDORS: VendorSummary[] = [
  {
    name: "Anthropic",
    logo: "anthropic.png",
    color: BRAND.anthropic,
    strengths: ["编码质量断层第一", "Agent 工具链最成熟"],
    weakness: "中文弱 / 价格最贵",
  },
  {
    name: "OpenAI",
    logo: "OpenAI.png",
    color: BRAND.openai,
    strengths: ["综合能力最均衡", "生态最完整"],
    weakness: "GPT-5.5 贵且慢",
  },
  {
    name: "Google",
    logo: "gemini.png",
    color: BRAND.google,
    strengths: ["1M 上下文", "免费额度充足"],
    weakness: "编码弱 / 幻觉偏高",
  },
  {
    name: "DeepSeek",
    logo: "DeepSeek.png",
    color: BRAND.deepseek,
    strengths: ["API 全网最便宜", "开源可部署"],
    weakness: "幻觉率高 / 审查严",
  },
  {
    name: "智谱 GLM",
    logo: "glm.png",
    color: BRAND.glm,
    strengths: ["国产综合第一", "开源生态好"],
    weakness: "护照税 2.35× / 峰时 3× 消耗",
  },
  {
    name: "Kimi",
    logo: "kimi.png",
    color: BRAND.kimi,
    strengths: ["MCP 工具调用强", "Claw Agent 好用"],
    weakness: "API 256K 上下文偏小",
  },
  {
    name: "通义千问",
    logo: "Qwen.png",
    color: BRAND.qwen,
    strengths: ["开源小模型最能打", "代码解释器内置"],
    weakness: "大模型存在感不足",
  },
  {
    name: "MiniMax",
    logo: "minimax.png",
    color: BRAND.minimax,
    strengths: ["cache $0.06 性价比突出", "M3 能力跃升"],
    weakness: "生态小众 / 文档少",
  },
  {
    name: "豆包",
    logo: "doubao.png",
    color: BRAND.doubao,
    strengths: ["语音交互最佳", "Seed 2.0 进步大"],
    weakness: "API 能力偏弱",
  },
];

function StepVendorGrid({ step }: ChapterStepProps) {
  return (
    <div className="rc-grid-page" key={step}>
      <h2 className="rc-grid-title">厂商专长速查</h2>
      <div className="rc-grid">
        {VENDORS.map((v, i) => (
          <div
            key={v.name}
            className="rc-vendor-card"
            style={{ "--rc-color": v.color, animationDelay: `${200 + i * 80}ms` } as React.CSSProperties}
          >
            <div className="rc-vendor-head">
              <img className="rc-vendor-logo" src={`/logos/${v.logo}`} alt="" />
              <span className="rc-vendor-name">{v.name}</span>
            </div>
            <div className="rc-vendor-body">
              {v.strengths.map((s) => (
                <div key={s} className="rc-strength">
                  <span className="rc-strength-icon">+</span>
                  <span className="rc-strength-text">{s}</span>
                </div>
              ))}
              <div className="rc-weakness">
                <span className="rc-weakness-icon">−</span>
                <span className="rc-weakness-text">{v.weakness}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ Main ═══ */

export default function Recommend({ step }: ChapterStepProps) {
  switch (step) {
    case 0:
      return <StepTitle step={step} />;
    case 1:
      return <StepDaily step={step} />;
    case 2:
      return <StepCostDev step={step} />;
    case 3:
      return <StepQualityDev step={step} />;
    case 4:
      return <StepVendorGrid step={step} />;
    default:
      return null;
  }
}

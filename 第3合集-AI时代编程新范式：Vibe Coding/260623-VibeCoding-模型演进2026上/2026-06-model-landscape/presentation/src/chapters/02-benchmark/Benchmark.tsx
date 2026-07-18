import type { ChapterStepProps } from "../../registry/types";
import { MaskReveal } from "../../components/MaskReveal";
import "./Benchmark.css";

/* ── brand colors ── */
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

/* ── ranking data ── */
const TOP10 = [
  { rank: 1, name: "Claude Opus 4.8", score: 55.7, logo: "anthropic.png", domestic: false, color: BRAND.anthropic },
  { rank: 2, name: "GPT-5.5", score: 54.8, logo: "OpenAI.png", domestic: false, color: BRAND.openai },
  { rank: 3, name: "Claude Opus 4.7", score: 53.5, logo: "anthropic.png", domestic: false, color: BRAND.anthropic },
  { rank: 4, name: "GPT-5.4", score: 51.4, logo: "OpenAI.png", domestic: false, color: BRAND.openai },
  { rank: 5, name: "GLM-5.2", score: 51.1, logo: "glm.png", domestic: true, color: BRAND.glm },
  { rank: 6, name: "Gemini 3.5 Flash", score: 50.2, logo: "gemini.png", domestic: false, color: BRAND.google },
  { rank: 7, name: "Gemini 3.1 Pro", score: 46.5, logo: "gemini.png", domestic: false, color: BRAND.google },
  { rank: 8, name: "Qwen3.7 Max", score: 46.0, logo: "Qwen.png", domestic: true, color: BRAND.qwen },
  { rank: 9, name: "MiniMax M3", score: 44.4, logo: "minimax.png", domestic: true, color: BRAND.minimax },
  { rank: 10, name: "DeepSeek V4 Pro", score: 44.3, logo: "DeepSeek.png", domestic: true, color: BRAND.deepseek },
];
const MAX_SCORE = 70;
const MIN_SCORE = 40;

/* ── reusable bar row ── */
function BarRow({
  model,
  value,
  maxVal,
  show,
  delay,
  muted,
  selfReport,
  suffix = "%",
}: {
  model: string;
  value: number;
  maxVal: number;
  show: boolean;
  delay: number;
  muted?: boolean;
  selfReport?: boolean;
  suffix?: string;
}) {
  const w = (value / maxVal) * 100;
  return (
    <div
      className={`bm-chart-row${show ? " bm-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="bm-chart-model">{model}</span>
      <div className="bm-chart-bar-track">
        <div
          className={`bm-chart-bar-fill${muted ? " bm-muted" : ""}${selfReport ? " bm-self-report" : ""}`}
          style={{
            width: `${w}%`,
            transitionDelay: `${delay + 200}ms`,
          }}
        />
      </div>
      <span className="bm-chart-val">
        {value}{suffix}
        {selfReport && <span className="bm-self-report-tag">self</span>}
      </span>
    </div>
  );
}

/* ── quote block ── */
function Quote({
  text,
  source,
  show,
  delay,
}: {
  text: string;
  source: string;
  show: boolean;
  delay: number;
}) {
  return (
    <div
      className={`bm-quote${show ? " bm-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="bm-quote-text" dangerouslySetInnerHTML={{ __html: text }} />
      <div className="bm-quote-source">{source}</div>
    </div>
  );
}

/* ── callout ── */
function Callout({
  num,
  label,
  show,
  delay,
}: {
  num: string;
  label: string;
  show: boolean;
  delay: number;
}) {
  return (
    <div
      className={`bm-callout${show ? " bm-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="bm-callout-num">{num}</span>
      <span className="bm-callout-label">{label}</span>
    </div>
  );
}


/* ── vendor trait pills ── */
function TraitRow({ traits, show }: { traits: { text: string; pro: boolean }[]; show: boolean }) {
  return (
    <div className={`bm-traits${show ? " bm-visible" : ""}`}>
      {traits.map((t, i) => (
        <span
          key={i}
          className={`bm-trait ${t.pro ? "bm-trait--pro" : "bm-trait--con"}`}
          style={{ transitionDelay: `${300 + i * 60}ms` }}
        >
          <span className="bm-trait-icon">{t.pro ? "+" : "−"}</span>
          {t.text}
        </span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Step 0 — AA Intelligence Index Top 10
 * ═══════════════════════════════════════════════════════════════════════ */
function StepRanking({ step }: ChapterStepProps) {
  return (
    <div className="bm-ranking">
      <MaskReveal show={step >= 0} duration={800}>
        <h1 className="bm-ranking-title">
          能力 Benchmark 与社区评价
        </h1>
      </MaskReveal>
      <MaskReveal show={step >= 0} delay={300} duration={600}>
        <p className="bm-ranking-subtitle">
          Artificial Analysis 综合能力指数 v4.1 &mdash; Top 10
        </p>
      </MaskReveal>

      <div className="bm-ranking-list">
        {/* Fable 5 — #1 but banned */}
        <div
          className={`bm-ranking-row bm-ranking-row--banned${step >= 0 ? " bm-visible" : ""}`}
          style={{ "--vendor-color": BRAND.anthropic, transitionDelay: "400ms" } as React.CSSProperties}
        >
          <span className="bm-ranking-ord">&mdash;</span>
          <img className="bm-ranking-logo" src="/logos/anthropic.png" alt="" />
          <span className="bm-ranking-name">Claude Fable 5</span>
          <div className="bm-ranking-bar-wrap">
            <div
              className="bm-ranking-bar"
              style={{
                width: `${((64.9 - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100}%`,
                transitionDelay: "600ms",
              }}
            />
            <span className="bm-ranking-banned-tag">BANNED 6/12</span>
          </div>
          <span className="bm-ranking-score">64.9%</span>
        </div>

        {TOP10.map((d, i) => {
          const barW = ((d.score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 100;
          return (
            <div
              key={d.rank}
              className={`bm-ranking-row${step >= 0 ? " bm-visible" : ""}${d.domestic ? " bm-domestic" : ""}`}
              style={{ "--vendor-color": d.color, transitionDelay: `${480 + i * 80}ms` } as React.CSSProperties}
            >
              <span className="bm-ranking-ord">{d.rank}</span>
              <img className="bm-ranking-logo" src={`/logos/${d.logo}`} alt="" />
              <span className="bm-ranking-name">{d.name}</span>
              <div className="bm-ranking-bar-wrap">
                <div
                  className="bm-ranking-bar"
                  style={{
                    width: `${barW}%`,
                    transitionDelay: `${680 + i * 80}ms`,
                  }}
                />
              </div>
              <span className="bm-ranking-score">{d.score}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 1 — Anthropic
 * ═══════════════════════════════════════════════════════════════════════ */
function StepAnthropic({ step }: ChapterStepProps) {
  const s = step >= 1;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.anthropic } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/anthropic.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name">Anthropic</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "1M 上下文", pro: true },
        { text: "最强编码", pro: true },
        { text: "多模态识别（4.7+）", pro: true },
        { text: "相对中立", pro: true },
        { text: "中文表达倒退", pro: false },
        { text: "4.8 不稳定", pro: false },
        { text: "价格极贵", pro: false },
        { text: "封禁策略严苛", pro: false },
      ]} />

      <div className="bm-vendor-body">
        {/* left: benchmark chart */}
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="Fable 5" value={64.9} maxVal={70} show={s} delay={200} selfReport />
          <BarRow model="Opus 4.8" value={55.7} maxVal={70} show={s} delay={280} />
          <BarRow model="Opus 4.7" value={53.5} maxVal={70} show={s} delay={360} />

          <div className="bm-bench-group">SWE-bench Pro（软件工程·标准化）</div>
          <BarRow model="Fable 5" value={80.3} maxVal={100} show={s} delay={440} selfReport />
          <BarRow model="Opus 4.8" value={69.2} maxVal={100} show={s} delay={520} selfReport />
          <BarRow model="Opus 4.6" value={51.9} maxVal={100} show={s} delay={600} />
          <BarRow model="Opus 4.5" value={45.9} maxVal={100} show={s} delay={680} />

          <div className="bm-bench-group">Terminal-Bench 2.1（终端任务）</div>
          <BarRow model="Fable 5" value={88.0} maxVal={100} show={s} delay={760} />
          <BarRow model="Opus 4.8" value={74.6} maxVal={100} show={s} delay={840} />
          <BarRow model="Opus 4.7" value={69.4} maxVal={100} show={s} delay={920} />
          <BarRow model="Opus 4.6" value={76.4} maxVal={100} show={s} delay={1000} />
        </div>

        {/* right: community quotes */}
        <div className="bm-quotes">
          <Quote
            text={`<em>"Misanthropic."</em>`}
            source="Robert Scoble &mdash; on Fable 5 safety"
            show={s}
            delay={500}
          />
          <Quote
            text="cancer 被标记为生物安全风险——免疫学教授无法正常讨论研究"
            source="Community backlash"
            show={s}
            delay={700}
          />
          <Quote
            text="4.7 tokenizer 变相涨价 35%"
            source="Developer pricing analysis"
            show={s}
            delay={900}
          />
          <Callout
            num="3 天"
            label="Fable 5 从发布到被禁的周期——史上最戏剧性"
            show={s}
            delay={1100}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 2 — OpenAI
 * ═══════════════════════════════════════════════════════════════════════ */
function StepOpenAI({ step }: ChapterStepProps) {
  const s = step >= 2;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.openai } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/OpenAI.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name">OpenAI</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "1M 上下文", pro: true },
        { text: "最博学", pro: true },
        { text: "多模态", pro: true },
        { text: "推理最深", pro: true },
        { text: "代码稳健", pro: true },
        { text: "中文 AI 味重", pro: false },
        { text: "不会说不知道", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="GPT-5.5" value={54.8} maxVal={MAX_SCORE} show={s} delay={200} />
          <BarRow model="GPT-5.4" value={51.4} maxVal={MAX_SCORE} show={s} delay={280} />

          <div className="bm-bench-group">SWE-bench Pro（软件工程·标准化）</div>
          <BarRow model="Opus 4.8" value={69.2} maxVal={100} show={s} delay={360} muted selfReport />
          <BarRow model="GPT-5.4" value={59.1} maxVal={100} show={s} delay={440} />

          <div className="bm-bench-group">Terminal-Bench（终端任务）</div>
          <BarRow model="GPT-5.5" value={82.7} maxVal={100} show={s} delay={520} />
          <BarRow model="GPT-5.4" value={75.1} maxVal={100} show={s} delay={600} />

          <div className="bm-bench-group">LMArena Elo（人类盲评）</div>
          <BarRow model="GPT-5.5 Pro" value={1465} maxVal={1600} show={s} delay={680} suffix="" />
          <BarRow model="GPT-5.5" value={1440} maxVal={1600} show={s} delay={760} suffix="" />
        </div>

        <div className="bm-quotes">
          <Callout
            num="86%"
            label="幻觉率——准确率最高 (57%) 但答错时 86% 选择编造"
            show={s}
            delay={500}
          />
          <Callout
            num="$30"
            label="GPT-5.5 输出价翻倍 $15 → $30 / 1M tokens"
            show={s}
            delay={700}
          />
          <Quote
            text="最博学却最不会说不知道"
            source="AA-Omniscience 评测结论"
            show={s}
            delay={900}
          />
          <Quote
            text="LiveCodeBench 被 DeepSeek V4 霸榜超过"
            source="Community benchmark tracking"
            show={s}
            delay={1100}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 3 — Google
 * ═══════════════════════════════════════════════════════════════════════ */
function StepGoogle({ step }: ChapterStepProps) {
  const s = step >= 3;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.google } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/gemini.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name">Google / Gemini</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "1M 上下文", pro: true },
        { text: "全模态", pro: true },
        { text: "前端绘制强", pro: true },
        { text: "情绪价值高", pro: true },
        { text: "幻觉偏高", pro: false },
        { text: "编程能力弱", pro: false },
        { text: "逻辑较弱", pro: false },
        { text: "世界知识下降（3.1+）", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="Gemini 3.5 Flash" value={50.2} maxVal={MAX_SCORE} show={s} delay={200} />
          <BarRow model="Gemini 3.1 Pro" value={46.5} maxVal={MAX_SCORE} show={s} delay={280} />
          <BarRow model="Opus 4.8" value={55.7} maxVal={MAX_SCORE} show={s} delay={360} muted />

          <div className="bm-bench-group">HLE-Text（人类最后考试）</div>
          <BarRow model="Gemini 3.1 Pro" value={47.31} maxVal={60} show={s} delay={440} />

          <div className="bm-bench-group">LMArena Elo（人类盲评）</div>
          <BarRow model="Gemini 3.2 Pro" value={1448} maxVal={1600} show={s} delay={520} suffix="" />
          <BarRow model="Gemini 3.5 Flash" value={1418} maxVal={1600} show={s} delay={600} suffix="" />
          <BarRow model="Gemini 3.1 Pro" value={1448} maxVal={1600} show={s} delay={680} suffix="" />
        </div>

        <div className="bm-quotes">
          <Callout
            num="#1"
            label="HLE-Text Only 最难测试第一名 (47.31%)"
            show={s}
            delay={400}
          />
          <Callout
            num="-25%"
            label="3.5 Flash 比 3.1 Pro 便宜 25% 但 AA 分更高"
            show={s}
            delay={600}
          />
          <Quote
            text={`AI Pro <em>"静默降级"</em>——限额悄悄缩，5h 窗口刷新机制`}
            source="Community reports"
            show={s}
            delay={800}
          />
          <Quote
            text="左手放价右手收量"
            source="I/O 2026 社区反应"
            show={s}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 4 — DeepSeek
 * ═══════════════════════════════════════════════════════════════════════ */
function StepDeepSeek({ step }: ChapterStepProps) {
  const s = step >= 4;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.deepseek } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/DeepSeek.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name">DeepSeek</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "1M 上下文（V4+）", pro: true },
        { text: "价格极低", pro: true },
        { text: "全模型开源", pro: true },
        { text: "缓存命中率极高", pro: true },
        { text: "编程与主流有差距", pro: false },
        { text: "不支持多模态", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="V4-Pro" value={44.3} maxVal={MAX_SCORE} show={s} delay={200} />
          {/* reference */}
          <BarRow model="GPT-5.5" value={54.8} maxVal={MAX_SCORE} show={s} delay={280} muted />

          <div className="bm-bench-group">LiveCodeBench（实时编程）</div>
          <BarRow model="V4-Pro" value={93.5} maxVal={100} show={s} delay={360} />
          <BarRow model="V4-Flash" value={91.6} maxVal={100} show={s} delay={440} />
          {/* reference */}
          <BarRow model="GPT-5.5" value={82.7} maxVal={100} show={s} delay={520} muted />

          <div className="bm-bench-group">Terminal-Bench（终端任务）</div>
          <BarRow model="GPT-5.4" value={75.1} maxVal={100} show={s} delay={600} muted />
          {/* DeepSeek no data, show reference only */}
        </div>

        <div className="bm-quotes">
          <Callout
            num="94%"
            label="幻觉率——不知道时从不说不知道"
            show={s}
            delay={400}
          />
          <Callout
            num="1/10"
            label="价格是 Claude / GPT 的 1/10 ~ 1/28"
            show={s}
            delay={600}
          />
          <Quote
            text={`<em>"best value AI model, but not the best coder"</em>`}
            source="Cybernews"
            show={s}
            delay={800}
          />
          <Quote
            text="V4P 编程能力下滑——'降智'争议 + 核心团队流失"
            source="Community & industry reports"
            show={s}
            delay={1000}
          />
          <Quote
            text="R2 至今未出，CEO 对性能不满意"
            source="500 亿融资后的沉默"
            show={s}
            delay={1200}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 5 — GLM
 * ═══════════════════════════════════════════════════════════════════════ */
function StepGLM({ step }: ChapterStepProps) {
  const s = step >= 5;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.glm } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/glm.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name bm-vendor-name-cn">智谱 GLM</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "国产领跑（5.1 起）", pro: true },
        { text: "推理能力强", pro: true },
        { text: "1M（5.2+）", pro: true },
        { text: "编程可用", pro: true },
        { text: "思维链冗长慢", pro: false },
        { text: "无多模态", pro: false },
        { text: "国内价格偏高", pro: false },
        { text: "难抢", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="GLM-5.2" value={51.1} maxVal={MAX_SCORE} show={s} delay={200} />
          {/* references */}
          <BarRow model="Opus 4.8" value={55.7} maxVal={MAX_SCORE} show={s} delay={280} muted />
          <BarRow model="Gemini 3.1 Pro" value={46.5} maxVal={MAX_SCORE} show={s} delay={360} muted />

          <div className="bm-bench-group">SWE-bench Pro（软件工程）</div>
          <BarRow model="GLM-5.2" value={62.1} maxVal={100} show={s} delay={440} />
          <BarRow model="GLM-5.1" value={58.4} maxVal={100} show={s} delay={520} selfReport />
          <BarRow model="GPT-5.4" value={59.1} maxVal={100} show={s} delay={600} muted />

          <div className="bm-bench-group">Code Arena（代码竞技）</div>
          <BarRow model="GLM-5.2" value={92} maxVal={100} show={s} delay={680} suffix=" (WebDev #2)" />
        </div>

        <div className="bm-quotes">
          <Callout
            num="#5"
            label="AA Index 国产最高，超过 Gemini 3.1 Pro"
            show={s}
            delay={400}
          />
          <Quote
            text={`<em>"probably the most powerful text-only open weights LLM"</em>`}
            source="Simon Willison"
            show={s}
            delay={600}
          />
          <Quote
            text="Fable 被禁第二天中国就放出了 GLM-5.2"
            source="@bridgemindai on X"
            show={s}
            delay={800}
          />
          <Quote
            text="'护照税'——海外价格是国内 2.35 倍；高峰期 3x 消耗系数"
            source="Pricing community report"
            show={s}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 6 — Kimi
 * ═══════════════════════════════════════════════════════════════════════ */
function StepKimi({ step }: ChapterStepProps) {
  const s = step >= 6;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.kimi } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/kimi.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name">Kimi</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "多模态（K2.5+）", pro: true },
        { text: "MCP 工具调用强", pro: true },
        { text: "能力中规中矩", pro: false },
        { text: "计费不友好", pro: false },
        { text: "无 1M 上下文", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="K2.6" value={42.8} maxVal={MAX_SCORE} show={s} delay={200} />
          {/* reference */}
          <BarRow model="Opus 4.8" value={55.7} maxVal={MAX_SCORE} show={s} delay={280} muted />

          <div className="bm-bench-group">Terminal-Bench（终端任务）</div>
          <BarRow model="K2.6" value={66.7} maxVal={100} show={s} delay={360} />
          {/* reference */}
          <BarRow model="GPT-5.5" value={82.7} maxVal={100} show={s} delay={440} muted />

          <div className="bm-bench-group">SWE-bench Pro（软件工程）</div>
          <BarRow model="K2.7-Code" value={58.6} maxVal={100} show={s} delay={520} />
          <BarRow model="K2.6" value={80.2} maxVal={100} show={s} delay={600} selfReport />

          <div className="bm-bench-group">MCP（工具调用能力）</div>
          <BarRow model="K2.6" value={81.1} maxVal={100} show={s} delay={680} />
          <BarRow model="Opus 4.8" value={76.4} maxVal={100} show={s} delay={760} muted />
        </div>

        <div className="bm-quotes">
          <Quote
            text="体感比 2.6 好，但还替代不了 Claude"
            source="V2EX"
            show={s}
            delay={400}
          />
          <Quote
            text="直接给我把 pnpm-workspace.yaml 删了"
            source="V2EX &mdash; 负面反馈"
            show={s}
            delay={600}
          />
          <Quote
            text="不争全能是因为全能确实争不过"
            source="知乎"
            show={s}
            delay={800}
          />
          <Callout
            num="$5B"
            label={`Cursor 偷家事件——"It was a miss" (Cursor VP)`}
            show={s}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 7 — MiniMax
 * ═══════════════════════════════════════════════════════════════════════ */
function StepMiniMax({ step }: ChapterStepProps) {
  const s = step >= 7;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.minimax } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/minimax.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name">MiniMax</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "原生多模态", pro: true },
        { text: "1M 上下文", pro: true },
        { text: "前端能力强", pro: true },
        { text: "Token Plan 好评", pro: true },
        { text: "品牌认知度低", pro: false },
        { text: "编程能力中等", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="MiniMax M3" value={44.4} maxVal={MAX_SCORE} show={s} delay={200} />
          <BarRow model="Opus 4.8" value={55.7} maxVal={MAX_SCORE} show={s} delay={280} muted />

          <div className="bm-bench-group">SWE-bench（软件工程）</div>
          <BarRow model="M3" value={59.0} maxVal={100} show={s} delay={360} selfReport />
          <BarRow model="GPT-5.4" value={59.1} maxVal={100} show={s} delay={440} muted />

          <div className="bm-bench-group">BrowseComp（网页理解）</div>
          <BarRow model="M3" value={83.5} maxVal={100} show={s} delay={520} />

          <div className="bm-bench-group">上下文窗口</div>
          <BarRow model="M3" value={1000} maxVal={1100} show={s} delay={600} suffix="K" />
        </div>

        <div className="bm-quotes">
          <Quote
            text={`<em>"要么是严肃工程成就，要么是好新闻稿"</em>`}
            source="Medium"
            show={s}
            delay={400}
          />
          <Quote
            text="M3 偏科生终于补齐了——文本+图像+语音+视频全模态"
            source="Community"
            show={s}
            delay={600}
          />
          <Callout
            num="83.5%"
            label="BrowseComp 网页理解——超过多数旗舰模型"
            show={s}
            delay={800}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 8 — Qwen
 * ═══════════════════════════════════════════════════════════════════════ */
function StepQwen({ step }: ChapterStepProps) {
  const s = step >= 8;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.qwen } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/Qwen.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name bm-vendor-name-cn">Qwen 通义</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "开源小模型出名", pro: true },
        { text: "幻觉率最低", pro: true },
        { text: "前端竞技前列", pro: true },
        { text: "大模型缺社区评价", pro: false },
        { text: "几乎无人编程用", pro: false },
        { text: "算力涨价 34%", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">AA Index（综合能力指数）</div>
          <BarRow model="Qwen3.7 Max" value={46.0} maxVal={MAX_SCORE} show={s} delay={200} />
          <BarRow model="Opus 4.8" value={55.7} maxVal={MAX_SCORE} show={s} delay={280} muted />

          <div className="bm-bench-group">Terminal-Bench（终端任务）</div>
          <BarRow model="Qwen3.7 Max" value={69.7} maxVal={100} show={s} delay={360} />
          <BarRow model="GPT-5.5" value={82.7} maxVal={100} show={s} delay={440} muted />

          <div className="bm-bench-group">幻觉率（越低越好）</div>
          <BarRow model="Qwen3.7 Max" value={22.9} maxVal={100} show={s} delay={520} />
          <BarRow model="GPT-5.5" value={86.0} maxVal={100} show={s} delay={600} muted />

          <div className="bm-bench-group">Arena WebDev（前端竞技）</div>
          <BarRow model="Qwen3.7 Max" value={4} maxVal={10} show={s} delay={680} suffix=" (rank)" />
        </div>

        <div className="bm-quotes">
          <Callout
            num="22.9%"
            label="幻觉率全网最低——最诚实的模型"
            show={s}
            delay={400}
          />
          <Quote
            text="开源小模型无敌，大模型存在感太弱"
            source="Community consensus"
            show={s}
            delay={600}
          />
          <Quote
            text="开源小模型全网最能打，大模型存在感不够"
            source="Community consensus"
            show={s}
            delay={800}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Step 9 — Doubao
 * ═══════════════════════════════════════════════════════════════════════ */
function StepDoubao({ step }: ChapterStepProps) {
  const s = step >= 9;
  return (
    <div className="bm-vendor" style={{ "--vendor-color": BRAND.doubao } as React.CSSProperties}>
      <div className="bm-vendor-header">
        <img className="bm-vendor-logo" src="/logos/doubao.png" alt="" />
        <MaskReveal show={s} duration={700}>
          <h2 className="bm-vendor-name bm-vendor-name-cn">豆包 Seed 2.0</h2>
        </MaskReveal>
      </div>
      <hr className={`bm-vendor-rule${s ? " bm-visible" : ""}`} />

      <TraitRow show={s} traits={[
        { text: "LMArena 视觉 Top 4", pro: true },
        { text: "字节生态加持", pro: true },
        { text: "幻觉率居高不下", pro: false },
        { text: "HLE 数据存疑", pro: false },
        { text: "无人编程用", pro: false },
        { text: "从免费转付费", pro: false },
      ]} />

      <div className="bm-vendor-body">
        <div className="bm-chart">
          <div className="bm-bench-group">HLE（人类最后考试·声称）</div>
          <BarRow model="Seed 2.0 Pro" value={54.2} maxVal={60} show={s} delay={200} selfReport />
          <BarRow model="Gemini 3.1 Pro" value={47.3} maxVal={60} show={s} delay={280} muted />

          <div className="bm-bench-group">LMArena Elo（人类盲评·文本）</div>
          <BarRow model="Seed 2.0 Pro" value={6} maxVal={10} show={s} delay={360} suffix=" (rank)" />

          <div className="bm-bench-group">LMArena（人类盲评·视觉）</div>
          <BarRow model="Seed 2.0 Pro" value={3.5} maxVal={10} show={s} delay={440} suffix=" (rank)" />
        </div>

        <div className="bm-quotes">
          <Callout
            num="54.2%"
            label="HLE 声称全球最高——但 Scale 官方榜上没有"
            show={s}
            delay={400}
          />
          <Quote
            text={`HLE 54.2% 数字不在 Scale 官方榜上——<em>严重存疑</em>`}
            source="Scale leaderboard"
            show={s}
            delay={600}
          />
          <Quote
            text="张一鸣也烧不起了——从免费转付费订阅"
            source="Community"
            show={s}
            delay={800}
          />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════
 * Main chapter component
 * ═══════════════════════════════════════════════════════════════════════ */
export default function Benchmark({ step }: ChapterStepProps) {
  if (step === 0) return <div className="scene" key={0}><StepRanking step={step} /></div>;
  if (step === 1) return <div className="scene" key={1}><StepAnthropic step={step} /></div>;
  if (step === 2) return <div className="scene" key={2}><StepOpenAI step={step} /></div>;
  if (step === 3) return <div className="scene" key={3}><StepGoogle step={step} /></div>;
  if (step === 4) return <div className="scene" key={4}><StepDeepSeek step={step} /></div>;
  if (step === 5) return <div className="scene" key={5}><StepGLM step={step} /></div>;
  if (step === 6) return <div className="scene" key={6}><StepKimi step={step} /></div>;
  if (step === 7) return <div className="scene" key={7}><StepMiniMax step={step} /></div>;
  if (step === 8) return <div className="scene" key={8}><StepQwen step={step} /></div>;
  if (step === 9) return <div className="scene" key={9}><StepDoubao step={step} /></div>;
  return <div className="scene" key={-1}><StepRanking step={step} /></div>;
}

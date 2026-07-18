const models = [...window.__BENCHMARK_MODELS__].sort((a, b) => b.scores.total - a.scores.total);
const weights = window.__BENCHMARK_WEIGHTS__;
const slots = window.__BENCHMARK_SLOTS__;
const app = document.getElementById("app");

const totals = {
  total: models.length,
  success: models.filter((model) => model.oneshot_status === "成功").length,
  partial: models.filter((model) => model.oneshot_status === "部分成功").length,
  failed: models.filter((model) => model.oneshot_status === "失败").length,
  offPrompt: models.filter((model) => model.tags.includes("偏题实现")).length,
};

const topModel = models[0];
const bottomModel = models[models.length - 1];
const strongestUi = [...models].sort((a, b) => b.scores.ui_quality - a.scores.ui_quality)[0];
const strongestBackend = [...models].sort((a, b) => b.scores.backend_quality - a.scores.backend_quality)[0];
const strongestArchitecture = [...models].sort((a, b) => b.scores.architecture_quality - a.scores.architecture_quality)[0];
const slotSummaryKey = {
  slot_a_home: "home",
  slot_b_video: "video",
  slot_c_comment_danmaku: "comment_danmaku",
  slot_d_login: "login",
  slot_e_favorites: "favorites",
  slot_f_architecture: "architecture",
};
const featureLabels = {
  playback: "播放与官网跳转",
  video_info: "视频信息展示",
  comments: "评论查看",
  danmaku: "弹幕查看",
  login: "登录流程",
  post_login_actions: "登录后互动",
  favorites: "收藏/个人中心",
};

function tagClass(tag) {
  if (tag.includes("成功")) return "good";
  if (tag.includes("部分")) return "warn";
  if (tag.includes("失败") || tag.includes("残缺")) return "bad";
  return "pink";
}

function formatList(values, fallback = "无") {
  return values && values.length ? values.join("、") : fallback;
}

function renderSentenceBlocks(text) {
  const safeText = (text || "").trim();
  if (!safeText) return "";
  const chunks = safeText
    .split(/(?<=[。！？；])/)
    .map((item) => item.trim())
    .filter(Boolean);
  return chunks.map((item) => `<span class="reason-line">${item}</span>`).join("");
}

function renderSidebar() {
  const sections = [
    ["overview", "总榜", "综合排名与高低分样本"],
    ["feature-compare", "功能对比", "按播放/评论/登录横向对照"],
    ["gallery", "截图对比", "6 个统一截图槽位并排看"],
    ["architecture", "架构对比", "目录、分层、文档和冗余文件"],
    ["model-details", "模型详细页", "逐个模型的完整评价卡"],
    ["methodology", "方法论", "评分权重与实测规则"],
  ];
  return `
    <aside class="sidebar-panel">
      <div class="sidebar-block">
        <div class="sidebar-kicker">Report Navigation</div>
        <h2 class="sidebar-title">讲解目录</h2>
        <p class="sidebar-copy">左侧目录固定，右侧自由滚动。章节入口和模型详情锚点分开列出，适合录屏时直接按顺序讲。</p>
      </div>
      <div class="sidebar-block">
        <div class="sidebar-label">页面章节</div>
        <div class="sidebar-list">
          ${sections.map(([id, title, summary]) => `
            <a class="sidebar-link" href="#${id}" data-nav-link>
              <strong>${title}</strong>
              <span>${summary}</span>
            </a>
          `).join("")}
        </div>
      </div>
      <div class="sidebar-block">
        <div class="sidebar-label">模型锚点</div>
        <div class="sidebar-model-list">
          ${models.map((model, index) => `
            <a class="sidebar-link sidebar-model" href="#${model.model_id}" data-nav-link>
              <div class="sidebar-model-copy">
                <div class="sidebar-rank">#${index + 1}</div>
                <strong>${model.display_name}</strong>
                <span>${model.sample_type_label} · ${model.oneshot_status}</span>
              </div>
              <span class="sidebar-score">${model.scores.total}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </aside>
  `;
}

function renderHero() {
  return `
    <section class="hero">
      <div class="hero-panel">
        <div class="hero-inner">
          <div>
            <div class="hero-kicker">Bilibili One-Shot Benchmark</div>
            <h1 class="hero-title">大模型一轮直出<br/>B站平台横测报告</h1>
            <p class="hero-summary">报告只基于当前仓库和真实运行结果打分，不给“看起来像完整项目”额外加分。每个模型都保留同一套截图槽位，做成页的展示实拍，做不成的展示明确失败态或证据态卡片，方便横向讲解时逐项对照。</p>
          </div>
          <div class="hero-side">
            <div class="hero-chip"><strong>${totals.total}</strong> 个模型样本</div>
            <div class="hero-chip"><strong>${totals.success}</strong> 个 oneshot 成功</div>
            <div class="hero-chip"><strong>${totals.partial}</strong> 个部分成功</div>
            <div class="hero-chip"><strong>${totals.failed}</strong> 个失败</div>
            <div class="hero-chip"><strong>${totals.offPrompt}</strong> 个偏题样本</div>
          </div>
        </div>
        <nav class="hero-nav">
          <a href="#overview">总榜</a>
          <a href="#feature-compare">功能对比</a>
          <a href="#gallery">截图对比</a>
          <a href="#architecture">架构对比</a>
          <a href="#model-details">模型详细页</a>
          <a href="#methodology">方法论</a>
        </nav>
      </div>
    </section>
  `;
}

function renderStats() {
  return `
    <section class="section" id="overview">
      <div class="section-title">
        <div>
          <h2>总览</h2>
          <p>本版总榜改成“后端代码严审 40 分 + UI 人工复核 30 分 + 其余 30 分”。其中架构分单列，不再藏在维护性里；后端分也按代码细节重判，不再因为“功能勉强有了”就给相近分数。</p>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat-card panel">
          <div class="stat-label">综合第一</div>
          <div class="stat-value">${topModel.display_name}</div>
          <div class="stat-meta">${topModel.scores.total} 分 · ${topModel.oneshot_status}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">UI 最佳</div>
          <div class="stat-value">${strongestUi.display_name}</div>
          <div class="stat-meta">UI/交互 ${strongestUi.scores.ui_quality} / ${weights.ui_quality}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">后端最佳</div>
          <div class="stat-value">${strongestBackend.display_name}</div>
          <div class="stat-meta">后端 ${strongestBackend.scores.backend_quality} / ${weights.backend_quality}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">架构最佳</div>
          <div class="stat-value">${strongestArchitecture.display_name}</div>
          <div class="stat-meta">架构 ${strongestArchitecture.scores.architecture_quality} / ${weights.architecture_quality}</div>
        </div>
        <div class="stat-card panel">
          <div class="stat-label">低分样本</div>
          <div class="stat-value">${bottomModel.display_name}</div>
          <div class="stat-meta">${bottomModel.scores.total} 分 · ${bottomModel.tags.join(" / ")}</div>
        </div>
      </div>
    </section>
  `;
}

function renderRanking() {
  const rows = models.map((model, index) => {
    const stack = model.tech_stack.map((item) => `<span class="mini-chip">${item}</span>`).join("");
    const tags = model.tags.map((tag) => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join(" ");
    return `
      <tr>
        <td><div class="rank">#${index + 1}</div></td>
        <td>
          <div class="model-name">${model.display_name}</div>
          <div style="margin-top: 8px; color: var(--muted); font-size: 14px;">${model.sample_type_label} · ${model.notes}</div>
          <div class="meta-stack">${stack}</div>
        </td>
        <td>
          <div class="score-box">
            <div class="score-total">${model.scores.total}</div>
            <div class="pill-row">${tags}</div>
          </div>
        </td>
        <td>
          <strong>${model.startup_status.status_label}</strong>
          <div class="startup-copy" style="margin-top: 8px;">${renderSentenceBlocks(model.startup_status.summary)}</div>
        </td>
        <td>
          <div class="score-breakdown">
            <span>后端 ${model.scores.backend_quality}/${weights.backend_quality}</span>
            <span>UI ${model.scores.ui_quality}/${weights.ui_quality}</span>
            <span>架构 ${model.scores.architecture_quality}/${weights.architecture_quality}</span>
            <span>功能 ${model.scores.functionality}/${weights.functionality}</span>
            <span>运行 ${model.scores.runnability}/${weights.runnability}</span>
          </div>
        </td>
        <td><div class="reason-copy">${renderSentenceBlocks(model.score_reason_summary)}</div></td>
      </tr>
    `;
  }).join("");

  return `
    <section class="section">
      <div class="section-title">
        <div>
          <h2>综合总榜</h2>
          <p>当前排序优先放大三件事：后端代码是否稳、UI 是否真有产品感、系统架构是否清楚。关键分项先显示后端、UI 和架构；最后一列保留实测证据，避免只看高权重却看不到实际扣分点。</p>
        </div>
      </div>
      <div class="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>模型</th>
              <th>总分</th>
              <th>启动结论</th>
              <th>关键分项</th>
              <th>实测/扣分依据</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderFeatureCompare() {
  const features = [
    ["playback", "播放与官网跳转"],
    ["video_info", "视频信息展示"],
    ["comments", "评论查看"],
    ["danmaku", "弹幕查看"],
    ["login", "登录流程"],
    ["post_login_actions", "登录后评论/弹幕能力"],
    ["favorites", "收藏/个人中心能力"],
  ];
  const cards = features.map(([key, label]) => {
    const best = models.filter((model) => model.feature_matrix[key].status === "yes").map((model) => model.display_name);
    const partial = models.filter((model) => model.feature_matrix[key].status === "partial").map((model) => model.display_name);
    const missing = models.filter((model) => model.feature_matrix[key].status === "no").map((model) => model.display_name);
    return `
      <article class="feature-card panel">
        <h3>${label}</h3>
        <p><strong>明确具备：</strong>${formatList(best)}</p>
        <p style="margin-top: 10px;"><strong>部分具备：</strong>${formatList(partial)}</p>
        <p style="margin-top: 10px;"><strong>缺失/不可验证：</strong>${formatList(missing)}</p>
      </article>
    `;
  }).join("");

  return `
    <section class="section" id="feature-compare">
      <div class="section-title">
        <div>
          <h2>功能对比</h2>
          <p>这部分适合回答“谁能真实播放，谁只能看详情壳，谁连登录都没有接通”。状态判断直接来自功能矩阵，不额外做主观美化。</p>
        </div>
      </div>
      <div class="feature-grid">${cards}</div>
    </section>
  `;
}

function renderGallery() {
  const panels = slots.map((slot, index) => `
    <div class="gallery-slot-panel ${index === 0 ? "is-active" : ""}" data-gallery-panel="${slot.key}">
      <div class="gallery-slot-grid">
        ${models.map((model) => {
          const summaryKey = slotSummaryKey[slot.key];
          const imagePath = model.screenshot_slots[slot.key];
          const isRealShot = imagePath.endsWith(".png");
          return `
            <article class="gallery-card">
              <div class="gallery-card-head">
                <div>
                  <div class="model-name">${model.display_name}</div>
                  <div class="gallery-card-meta">${model.sample_type_label} · ${model.scores.total} 分</div>
                </div>
                <span class="subtle-chip">${isRealShot ? "真实截图" : "失败/证据态"}</span>
              </div>
              <a class="gallery-thumb" href="${imagePath}" data-fullimg="${imagePath}">
                <img src="${imagePath}" alt="${model.display_name} ${slot.label}" loading="lazy" />
              </a>
              <div class="gallery-card-copy">
                <strong>${slot.label}</strong>
                <p class="gallery-evidence">${model.runtime_summary[summaryKey] || model.runtime_summary.home}</p>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `).join("");
  return `
    <section class="section" id="gallery">
      <div class="section-title">
        <div>
          <h2>统一截图对比</h2>
          <p>这里改成“同一功能位看全部模型”的对比板，不再把 6 列截图硬塞进一张超宽矩阵。默认用概览密度先看全局，想看细节再切到清晰模式或点开原图。</p>
        </div>
      </div>
      <div class="panel" style="padding: 18px;">
        <div class="gallery-switcher" data-density="compact">
          <div class="gallery-head">
            <div class="gallery-toolbar">
              ${slots.map((slot, index) => `<button class="gallery-tab ${index === 0 ? "is-active" : ""}" type="button" data-gallery-tab="${slot.key}">${slot.label}</button>`).join("")}
            </div>
            <div class="gallery-controls">
              <div class="gallery-meta-note">默认每屏展示更多模型卡片，适合口播横向比较；点击图片可看原图，完整长评保留在“模型详情页”。</div>
              <div class="gallery-density-group" aria-label="截图密度切换">
                <span class="gallery-density-label">视图</span>
                <button class="gallery-density-button is-active" type="button" data-gallery-density="compact">概览</button>
                <button class="gallery-density-button" type="button" data-gallery-density="detail">清晰</button>
              </div>
            </div>
          </div>
          ${panels}
        </div>
      </div>
    </section>
  `;
}

function renderArchitecture() {
  const cards = models.map((model) => {
    const docs = model.static_metrics.docs_files && model.static_metrics.docs_files.length
      ? model.static_metrics.docs_files.map((file) => `<span class="subtle-chip">${file}</span>`).join("")
      : '<span class="subtle-chip">无成体系文档</span>';
    const tops = model.static_metrics.top_level_entries && model.static_metrics.top_level_entries.length
      ? model.static_metrics.top_level_entries.map((entry) => `<span class="subtle-chip">${entry}</span>`).join("")
      : '<span class="subtle-chip">无有效顶层目录</span>';
    const launch = model.launch && model.launch.length
      ? model.launch.map((item) => `${item.cwd} · ${item.cmd}`).join("<br/>")
      : "无可执行入口";
    return `
      <article class="tree-card panel">
        <div class="model-name">${model.display_name}</div>
        <div style="margin-top: 10px; color: var(--muted); font-size: 14px;">${model.sample_type_label} · 文件 ${model.static_metrics.file_count} · 文档 ${model.static_metrics.docs_count} · 调试/清单 ${model.static_metrics.debug_like_count}</div>
        <div style="margin-top: 8px; color: var(--muted); font-size: 14px;">架构 ${model.scores.architecture_quality}/${weights.architecture_quality} · 后端 ${model.scores.backend_quality}/${weights.backend_quality} · 前端工程 ${model.scores.frontend_quality}/${weights.frontend_quality}</div>
        <div class="pill-row" style="margin-top: 12px;">
          ${model.tech_stack.map((item) => `<span class="mini-chip">${item}</span>`).join("")}
        </div>
        <div class="pill-row" style="margin-top: 10px;">${tops}</div>
        <div class="arch-grid">
          <div class="arch-section"><strong>架构判断 · ${model.scores.architecture_quality}/${weights.architecture_quality}</strong><p>${model.architecture_review_summary}</p></div>
          <div class="arch-section"><strong>前端 · ${model.scores.frontend_quality}/${weights.frontend_quality}</strong><p>${model.frontend_quality_summary}</p></div>
          <div class="arch-section"><strong>后端 · ${model.scores.backend_quality}/${weights.backend_quality}</strong><p>${model.backend_quality_summary}</p></div>
          <div class="arch-section"><strong>可维护性</strong><p>${model.maintainability_summary}</p></div>
          <div class="arch-section"><strong>文档与仓库卫生</strong><p>${model.docs_quality_summary} ${model.waste_summary}</p></div>
          <div class="arch-section"><strong>主要入口</strong><p>${launch}</p></div>
        </div>
        <div class="pill-row" style="margin-top: 14px;">${docs}</div>
        <pre>${model.tree_summary.preview.join("\n")}</pre>
      </article>
    `;
  }).join("");
  return `
    <section class="section" id="architecture">
      <div class="section-title">
        <div>
          <h2>目录结构与架构对比</h2>
          <p>这里不只看树状图，而是逐个说明它到底是模板站、前后端分离、前端壳、桌面偏题还是残缺样本；前端、后端、文档和仓库卫生也一起展开，避免只凭文件多寡做判断。</p>
        </div>
      </div>
      <div class="tree-grid">${cards}</div>
    </section>
  `;
}

function renderScoreBars(model) {
  const labels = [
    ["backend_quality", "后端工程质量"],
    ["ui_quality", "UI 还原与交互"],
    ["architecture_quality", "架构设计"],
    ["functionality", "功能完成度"],
    ["runnability", "可运行性"],
    ["instruction_following", "指令遵循度"],
    ["frontend_quality", "前端工程质量"],
    ["docs_quality", "文档/注释"],
    ["waste_control", "垃圾代码控制"],
  ];
  return `
    <div class="score-bars">
      ${labels.map(([key, label]) => `
        <div class="score-bar">
          <div class="score-bar-head"><span>${label}</span><strong>${model.scores[key]} / ${weights[key]}</strong></div>
          <div class="track"><span style="width:${(model.scores[key] / weights[key]) * 100}%"></span></div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderModelDetails() {
  return `
    <section class="section" id="model-details">
      <div class="section-title">
        <div>
          <h2>每模型详细页</h2>
          <p>这里给逐个模型的完整评语。除了前后端、视觉、交互和分项分，还单独补进架构点评、证据备注和目录预览，方便你讲每个模型为什么得这个分。</p>
        </div>
      </div>
      <div class="model-detail-grid">
        ${models.map((model) => `
          <article class="model-detail panel" id="${model.model_id}">
            <div class="section-title" style="margin-bottom: 14px;">
              <div>
                <h2 style="font-size: 32px;">${model.display_name}</h2>
                <p>${model.notes}</p>
              </div>
              <div class="pill-row">
                <span class="tag ${tagClass("oneshot " + model.oneshot_status)}">oneshot ${model.oneshot_status}</span>
                ${model.tags.filter((tag) => !tag.startsWith("oneshot")).map((tag) => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join("")}
              </div>
            </div>
            <div class="detail-columns">
              <div class="detail-list">
                <div class="detail-item"><strong>样本类型</strong>${model.sample_type_label}</div>
                <div class="detail-item"><strong>技术栈</strong>${model.tech_stack.join(" / ") || "未识别"}</div>
                <div class="detail-item"><strong>启动判断</strong>${model.startup_status.status_label}。${model.startup_status.summary}</div>
                <div class="detail-item"><strong>架构点评</strong>${model.architecture_review_summary}</div>
                <div class="detail-item"><strong>指令遵循</strong>${model.instruction_following_summary}</div>
                <div class="detail-item"><strong>登录后能力审计</strong>${model.auth_review_summary}</div>
                <div class="detail-item"><strong>前端评价</strong>${model.frontend_quality_summary}</div>
                <div class="detail-item"><strong>后端评价</strong>${model.backend_quality_summary}</div>
                <div class="detail-item"><strong>后端打分依据</strong>${model.backend_scoring_summary}</div>
                <div class="detail-item"><strong>架构打分依据</strong>${model.architecture_scoring_summary}</div>
                <div class="detail-item"><strong>UI 打分依据</strong>${model.ui_scoring_summary}</div>
                <div class="detail-item"><strong>视觉审查</strong>${model.visual_review_summary}</div>
                <div class="detail-item"><strong>交互与流畅性</strong>${model.interaction_review_summary}</div>
                <div class="detail-item"><strong>维护性</strong>${model.maintainability_summary}</div>
                <div class="detail-item"><strong>文档/注释</strong>${model.docs_quality_summary}</div>
                <div class="detail-item"><strong>垃圾文件</strong>${model.waste_summary}</div>
                ${model.evidence_refs.runtime_note ? `<div class="detail-item"><strong>补充证据</strong>${model.evidence_refs.runtime_note}</div>` : ""}
              </div>
              <div>${renderScoreBars(model)}</div>
            </div>
            <div class="detail-columns" style="margin-top: 18px;">
              <div class="panel" style="padding: 18px;">
                <h3>功能矩阵</h3>
                <div class="detail-list">
                  ${Object.entries(model.feature_matrix).map(([key, item]) => `
                    <div class="detail-item">
                      <strong>${featureLabels[key]}</strong>
                      ${item.summary}
                    </div>
                  `).join("")}
                </div>
              </div>
              <div class="panel" style="padding: 18px;">
                <h3>目录结构预览</h3>
                <pre style="margin: 0; max-height: 420px;">${model.tree_summary.preview.join("\n")}</pre>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderMethodology() {
  const weightRows = [
    ["backend_quality", "后端工程质量"],
    ["ui_quality", "UI 还原与交互质量"],
    ["architecture_quality", "架构设计"],
    ["functionality", "功能完成度"],
    ["runnability", "可运行性"],
    ["instruction_following", "指令遵循度"],
    ["frontend_quality", "前端工程质量"],
    ["docs_quality", "代码规范、注释、文档"],
    ["waste_control", "垃圾代码与无效文件控制"],
  ].map(([key, label]) => `<li>${label}：${weights[key]} 分</li>`).join("");
  return `
    <section class="section" id="methodology">
      <div class="section-title">
        <div>
          <h2>方法论与评分标准</h2>
          <p>这一版改成强偏置评分：后端 40 分、UI 30 分、架构 8 分，其余 22 分再分给功能、可运行性、指令遵循和工程卫生。后端和架构都按代码细节逐模型重判，不再沿用自动映射。</p>
        </div>
      </div>
      <div class="method-grid">
        <article class="method-card panel">
          <h3>评分权重</h3>
          <ul>${weightRows}</ul>
        </article>
        <article class="method-card panel">
          <h3>后端复核口径</h3>
          <ul>
            <li>后端实现正确性：12 分，看 API 调用是否真实可用、是否依赖错误接口或私有字段。</li>
            <li>工程分层与边界：10 分，看 route、service、schema、auth、config 是否真正分开。</li>
            <li>状态与认证设计：8 分，看登录态、凭据存储、会话隔离、权限门禁是否合理。</li>
            <li>错误处理与可运维性：6 分，看参数校验、异常映射、配置化、启动稳定性。</li>
            <li>代码卫生：4 分，看硬编码、调试残留、全局状态和脆弱实现细节。</li>
          </ul>
        </article>
        <article class="method-card panel">
          <h3>UI 复核口径</h3>
          <ul>
            <li>美观完成度：10 分，看配色、排版、品牌完整度与整体质感。</li>
            <li>B 站风格与业务适配：8 分，看是否真的像 B 站视频平台，而不是泛视频站或后台面板。</li>
            <li>信息架构与阅读效率：7 分，看首页、详情页、评论区和登录入口是否符合视频产品的阅读路径。</li>
            <li>状态细节与异常表达：5 分，看空态、加载态、失败态、破图与门禁是否处理得像产品而不是 demo。</li>
          </ul>
        </article>
        <article class="method-card panel">
          <h3>架构复核口径</h3>
          <ul>
            <li>看前后端边界是否清楚，而不是把所有职责塞进一个入口文件。</li>
            <li>看外部 B 站能力是否被适配层隔离，而不是让业务代码直接到处调用底层库或手搓请求。</li>
            <li>看登录、评论、弹幕、收藏这些链路是否在系统设计上能闭环，而不是表面有页面、实则无承接层。</li>
          </ul>
        </article>
        <article class="method-card panel">
          <h3>执行原则</h3>
          <ul>
            <li>不修复参赛代码，结论基于当前仓库实际状态。</li>
            <li>本轮已在用户授权下使用真实 B 站凭据做只读验证，包括登录状态、个人资料和收藏读取；仍未做真实发评/发弹幕/收藏等副作用操作。</li>
            <li>所有模型必须拥有统一截图槽位；缺失功能也要用失败态图占位。</li>
            <li>偏题、残缺、前端壳样本统一进总榜，但会明确标注并重罚。</li>
            <li>oneshot 结论仍以真实运行状态为主，不因为权重重排而改写运行事实。</li>
          </ul>
        </article>
      </div>
      <p class="footer-note">报告入口：output/bilibili-benchmark-site/index.html · 证据文件与截图位均位于同目录下，适合本地离线讲解。</p>
    </section>
  `;
}

app.innerHTML = `
  <div class="page-shell">
    ${renderSidebar()}
    <div class="content-column">
      ${renderHero()}
      <main class="shell">
        ${renderStats()}
        ${renderRanking()}
        ${renderFeatureCompare()}
        ${renderGallery()}
        ${renderArchitecture()}
        ${renderModelDetails()}
        ${renderMethodology()}
      </main>
    </div>
  </div>
  <div class="modal" id="modal"><img alt="截图预览" /></div>
`;

const modal = document.getElementById("modal");
const modalImg = modal.querySelector("img");
document.querySelectorAll("[data-fullimg]").forEach((node) => {
  node.addEventListener("click", (event) => {
    event.preventDefault();
    modalImg.src = node.getAttribute("data-fullimg");
    modal.classList.add("open");
  });
});
modal.addEventListener("click", () => modal.classList.remove("open"));

const galleryTabs = [...document.querySelectorAll("[data-gallery-tab]")];
const galleryPanels = [...document.querySelectorAll("[data-gallery-panel]")];
const gallerySwitcher = document.querySelector(".gallery-switcher");
const galleryDensityButtons = [...document.querySelectorAll("[data-gallery-density]")];
galleryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.getAttribute("data-gallery-tab");
    galleryTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    galleryPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute("data-gallery-panel") === key);
    });
  });
});

galleryDensityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const density = button.getAttribute("data-gallery-density");
    galleryDensityButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    if (gallerySwitcher) {
      gallerySwitcher.setAttribute("data-density", density);
    }
  });
});

const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = [...new Set(navLinks.map((link) => link.getAttribute("href").slice(1)))]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

function refreshActiveNav() {
  let activeId = sections[0] ? sections[0].id : "";
  let bestDistance = Infinity;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const anchorDistance = Math.abs(rect.top - 160);
    if (rect.top <= window.innerHeight * 0.55 && anchorDistance < bestDistance) {
      bestDistance = anchorDistance;
      activeId = section.id;
    }
  });
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
  });
}

window.addEventListener("scroll", refreshActiveNav, { passive: true });
window.addEventListener("resize", refreshActiveNav);
refreshActiveNav();

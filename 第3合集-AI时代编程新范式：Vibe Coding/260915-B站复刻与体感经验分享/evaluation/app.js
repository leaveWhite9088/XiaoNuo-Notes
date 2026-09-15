(() => {
  'use strict';

  const DIMENSIONS = [
    { key: 'visual', label: '视觉还原', short: '视觉', max: 35 },
    { key: 'core', label: '核心流程', short: '流程', max: 20 },
    { key: 'interaction', label: '操作完成度', short: '操作', max: 15 },
    { key: 'stability', label: '稳定性', short: '稳定', max: 10 },
    { key: 'content', label: '内容与视频真实性', short: '内容', max: 10 },
    { key: 'engineering', label: '代码质量', short: '代码', max: 10 }
  ];

  const SCENES = [
    { id: 'home-top', label: '首页首屏', short: '首屏' },
    { id: 'home-scroll', label: '首页向下浏览一屏', short: '向下浏览' },
    { id: 'card-hover', label: '视频卡 hover 与菜单', short: '卡片菜单' },
    { id: 'search', label: '搜索建议和结果', short: '搜索' },
    { id: 'category', label: '分类切换后的页面', short: '分类' },
    { id: 'detail-player', label: '视频详情页播放状态', short: '详情播放' }
  ];

  const MODEL_NAMES = [
    ['claude-opus-5', 'Claude Opus 5'],
    ['deepseek-v4.1-flash', 'DeepSeek V4.1 Flash'],
    ['glm-5.3', 'GLM-5.3'],
    ['gpt-5.6-sol', 'GPT-5.6 Sol'],
    ['gpt-6-astra', 'GPT-6 Astra'],
    ['grok-4.6', 'Grok 4.6'],
    ['kimi-k3', 'Kimi K3'],
    ['minimax-m3', 'MiniMax M3'],
    ['qwen-3.8-flash', 'Qwen 3.8 Flash'],
    ['qwen-3.8-max', 'Qwen 3.8 Max']
  ];

  const PENDING_MODELS = MODEL_NAMES.map(([id, name]) => ({
    id,
    name,
    oneShot: { status: 'pending', score: null, scenes: [] },
    adversarial: { status: 'pending', score: null, scenes: [] }
  }));

  const state = {
    data: null,
    rankMode: 'one-shot',
    wallMode: 'one-shot',
    detailMode: 'one-shot',
    wallScene: SCENES[0].id,
    compareScene: SCENES[0].id,
    compareModel: MODEL_NAMES[0][0],
    detailModel: MODEL_NAMES[0][0]
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  function formatScore(value) {
    return isNumber(value) ? value.toFixed(1) : '暂未同步';
  }

  function formatDelta(value) {
    if (!isNumber(value)) return '暂未同步';
    if (value > 0) return `+${value.toFixed(1)}`;
    return value.toFixed(1);
  }

  function modeLabel(mode) {
    return mode === 'adversarial' ? '对抗性审查多轮结果' : '一次性指令直出';
  }

  function displayDimensionLabel(dimension) {
    return { core: '核心流程', interaction: '操作完成度', engineering: '代码质量' }[dimension.key] || dimension.label;
  }

  function humanizeVisibleText(value) {
    return String(value ?? '')
      .replace(/one-shot/gi, '一次性指令直出')
      .replace(/adversarial/gi, '对抗性审查多轮结果')
      .replace(/核心链路/g, '核心流程')
      .replace(/交互完成度/g, '操作完成度')
      .replace(/工程质量/g, '代码质量')
      .replace(/信息架构/g, '页面内容安排')
      .replace(/交互/g, '操作')
      .replace(/链路/g, '流程')
      .replace(/页面骨架/g, '页面基本结构')
      .replace(/列表续载/g, '向下浏览时新增内容')
      .replace(/延展感/g, '继续浏览的丰富程度')
      .replace(/横向溢出/g, '页面宽度超出屏幕')
      .replace(/占位/g, '灰色块');
  }

  function liveHref(model, mode) {
    const params = new URLSearchParams({ model: model.id, mode: mode === 'delta' ? 'one-shot' : mode });
    return `http://127.0.0.1:4399/live.html?${params.toString()}`;
  }

  function normalizeData(raw) {
    const models = Array.isArray(raw?.models) && raw.models.length ? raw.models : PENDING_MODELS;
    return {
      status: raw?.status || 'pending',
      updatedAt: raw?.updatedAt || null,
      scoreMethod: raw?.scoreMethod || null,
      selectionGuide: Array.isArray(raw?.selectionGuide) ? raw.selectionGuide : [],
      developmentNotes: Array.isArray(raw?.developmentNotes) ? raw.developmentNotes : [],
      scenes: Array.isArray(raw?.scenes) && raw.scenes.length ? raw.scenes : SCENES,
      dimensions: Array.isArray(raw?.dimensions) && raw.dimensions.length ? raw.dimensions : DIMENSIONS,
      models: models.map((model, index) => ({
        id: model.id || MODEL_NAMES[index]?.[0] || `model-${index + 1}`,
        name: model.name || MODEL_NAMES[index]?.[1] || model.id || `模型 ${index + 1}`,
        harness: model.harness || '未记录',
        oneShot: model.oneShot || model['one-shot'] || { status: 'pending', score: null, scenes: [] },
        adversarial: model.adversarial || { status: 'pending', score: null, scenes: [] }
      }))
    };
  }

  async function loadData() {
    const status = $('#data-status');
    status.textContent = '正在载入评测数据';
    const embeddedResults = globalThis.__EVALUATION_RESULTS__;
    const applyEmbeddedResults = () => {
      if (!embeddedResults) return false;
      state.data = normalizeData(embeddedResults);
      status.textContent = '评测数据已更新';
      return true;
    };
    try {
      if (window.location.protocol === 'file:' && applyEmbeddedResults()) {
        ensureSelections();
        renderAll();
        return;
      }
      const response = await fetch('./data/results.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = normalizeData(await response.json());
      status.textContent = state.data.status === 'complete' ? '评测数据已更新' : '占位数据 · 等待正式评测';
    } catch (error) {
      if (!applyEmbeddedResults()) {
        // 没有网络数据且没有内嵌数据时，才退回空状态。
        state.data = normalizeData({ status: 'pending', models: PENDING_MODELS });
        status.textContent = '占位数据 · 等待正式评测';
      }
    }
    ensureSelections();
    renderAll();
  }

  function ensureSelections() {
    const models = state.data.models;
    if (!models.some((model) => model.id === state.compareModel)) state.compareModel = models[0]?.id;
    if (!models.some((model) => model.id === state.detailModel)) state.detailModel = models[0]?.id;
    const scenes = state.data.scenes;
    if (!scenes.some((scene) => scene.id === state.wallScene)) state.wallScene = scenes[0]?.id;
    if (!scenes.some((scene) => scene.id === state.compareScene)) state.compareScene = scenes[0]?.id;
  }

  function getModeData(model, mode) {
    const key = mode === 'one-shot' ? 'oneShot' : mode;
    return model?.[key] || { status: 'pending', score: null, scenes: [] };
  }

  function readDimension(modeData, key) {
    const scores = modeData?.scores || modeData?.score?.dimensions || {};
    const value = scores[key];
    if (isNumber(value)) return value;
    if (isNumber(value?.value)) return value.value;
    return null;
  }

  function getTotal(modeData) {
    if (isNumber(modeData?.total)) return modeData.total;
    if (isNumber(modeData?.score?.total)) return modeData.score.total;
    const values = DIMENSIONS.map((dimension) => readDimension(modeData, dimension.key));
    return values.every(isNumber) ? values.reduce((sum, value) => sum + value, 0) : null;
  }

  function getSceneEntry(modeData, sceneId) {
    const scenes = modeData?.scenes;
    if (Array.isArray(scenes)) return scenes.find((scene) => scene.id === sceneId || scene.sceneId === sceneId) || null;
    if (scenes && typeof scenes === 'object') return scenes[sceneId] || null;
    return null;
  }

  function getImage(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') return entry;
    return entry.image || entry.src || entry.screenshot || entry.path || null;
  }

  function getSceneLabel(sceneId) {
    return state.data.scenes.find((scene) => scene.id === sceneId)?.label || SCENES.find((scene) => scene.id === sceneId)?.label || '评测场景';
  }

  function renderShot(entry, className, label) {
    const image = getImage(entry);
    if (image) {
      return `<div class="${className}" data-image="${escapeAttr(image)}" data-caption="${escapeAttr(label)}" role="button" tabindex="0" aria-label="放大${escapeAttr(label)}"><img src="${escapeAttr(image)}" alt="${escapeAttr(label)}" loading="lazy" /></div>`;
    }
    return `<div class="${className}" aria-label="${escapeAttr(label)}"><div class="shot-placeholder"><div><span>截图待采集</span><span>${escapeHtml(label)}</span></div></div></div>`;
  }

  function renderAll() {
    syncRankControls();
    renderOverview();
    renderSelects();
    renderLeaderboard();
    renderSelectionGuide();
    renderWall();
    renderCompare();
    renderDetail();
  }

  function renderOverview() {
    $('#model-count').textContent = state.data.models.length;
    $('#scene-count').textContent = state.data.scenes.length;
    const finished = state.data.models.filter((model) => {
      if (state.rankMode === 'delta') {
        return isNumber(getTotal(getModeData(model, 'oneShot')))
          && isNumber(getTotal(getModeData(model, 'adversarial')));
      }
      return isNumber(getTotal(getModeData(model, state.rankMode)));
    }).length;
    $('#ready-count').textContent = finished;
    $('#score-breakdown').innerHTML = state.data.dimensions.map((dimension) => `<div class="breakdown-row"><div class="breakdown-label"><span>${escapeHtml(displayDimensionLabel(dimension))}</span><span>${dimension.max} 分</span></div><div class="breakdown-track"><div class="breakdown-fill" style="width:${Math.round((dimension.max / 100) * 100)}%"></div></div></div>`).join('');
  }

  function renderSelects() {
    const sceneOptions = state.data.scenes.map((scene) => `<option value="${escapeAttr(scene.id)}">${escapeHtml(scene.label)}</option>`).join('');
    $('#wall-scene').innerHTML = sceneOptions;
    $('#compare-scene').innerHTML = sceneOptions;
    $('#wall-scene').value = state.wallScene;
    $('#compare-scene').value = state.compareScene;
    const compareOptions = sortedModels('one-shot').map((model) => `<option value="${escapeAttr(model.id)}">${escapeHtml(model.name)}</option>`).join('');
    const detailOptions = sortedModels(state.detailMode).map((model) => `<option value="${escapeAttr(model.id)}">${escapeHtml(model.name)}</option>`).join('');
    $('#compare-model').innerHTML = compareOptions;
    $('#detail-model').innerHTML = detailOptions;
    $('#compare-model').value = state.compareModel;
    $('#detail-model').value = state.detailModel;
  }

  function sortedModels(mode) {
    return [...state.data.models].sort((left, right) => {
      const leftScore = getTotal(getModeData(left, mode));
      const rightScore = getTotal(getModeData(right, mode));
      if (isNumber(leftScore) && isNumber(rightScore)) return rightScore - leftScore || left.name.localeCompare(right.name);
      if (isNumber(leftScore)) return -1;
      if (isNumber(rightScore)) return 1;
      return left.name.localeCompare(right.name);
    });
  }

  function renderSelectionGuide() {
    const guide = $('#selection-guide');
    const notes = $('#development-notes');
    if (!guide || !notes) return;
    guide.innerHTML = state.data.selectionGuide.map((item) => `<article class="panel guide-card"><span class="guide-kicker">适合这样用</span><h3>${escapeHtml(item.title)}</h3><div class="guide-models">${(item.models || []).map((model) => `<span>${escapeHtml(model)}</span>`).join('')}</div><p>${escapeHtml(humanizeVisibleText(item.summary))}</p></article>`).join('');
    notes.innerHTML = state.data.developmentNotes.map((note, index) => `<div class="lesson-item"><strong>${index + 1}</strong><p>${escapeHtml(humanizeVisibleText(note))}</p></div>`).join('');
  }

  function rankRows(rankMode) {
    const rows = state.data.models.map((model) => {
      const oneShot = getTotal(getModeData(model, 'oneShot'));
      const adversarial = getTotal(getModeData(model, 'adversarial'));
      const value = rankMode === 'delta' ? (isNumber(oneShot) && isNumber(adversarial) ? adversarial - oneShot : null) : rankMode === 'adversarial' ? adversarial : oneShot;
      return { model, value, oneShot, adversarial };
    }).sort((left, right) => {
      if (isNumber(left.value) && !isNumber(right.value)) return -1;
      if (!isNumber(left.value) && isNumber(right.value)) return 1;
      if (!isNumber(left.value) && !isNumber(right.value)) return 0;
      return rankMode === 'delta' ? right.value - left.value : right.value - left.value;
    });
    let rank = 0;
    let previousValue = null;
    rows.forEach((row, index) => {
      if (!isNumber(row.value)) {
        row.rank = null;
        return;
      }
      if (index === 0 || row.value !== previousValue) rank = index + 1;
      row.rank = rank;
      previousValue = row.value;
    });
    return rows;
  }

  function syncRankControls() {
    $$('.mode-button').forEach((button) => {
      button.classList.toggle('is-active', state.rankMode !== 'delta' && button.dataset.mode === state.rankMode);
    });
    $$('.rank-tab').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.rank === state.rankMode);
    });
  }

  function syncRankHeaders() {
    const headers = $$('.rank-table thead th');
    if (headers.length < 7) return;
    const labels = state.rankMode === 'delta' ? ['视觉差', '流程差', '操作差'] : ['视觉', '流程', '操作'];
    headers[3].textContent = labels[0];
    headers[4].textContent = labels[1];
    headers[5].textContent = labels[2];
  }

  function renderLeaderboard() {
    const rows = rankRows(state.rankMode);
    const isDelta = state.rankMode === 'delta';
    syncRankHeaders();
    $('#rank-hint').textContent = isDelta ? '多轮审查带来的分数变化' : `${modeLabel(state.rankMode)} · 成品分`;
    $('#rank-body').innerHTML = rows.map((row) => {
      const scoreClass = isDelta ? (row.value > 0 ? 'delta-positive' : row.value < 0 ? 'delta-negative' : 'delta-flat') : 'total-score';
      const modeData = getModeData(row.model, isDelta ? 'adversarial' : state.rankMode);
      const oneShotData = getModeData(row.model, 'oneShot');
      const adversarialData = getModeData(row.model, 'adversarial');
      const rankDimensions = ['visual', 'core', 'interaction'].map((key) => isDelta
        ? formatDeltaDimensionCell(adversarialData, oneShotData, key)
        : formatDimensionCell(modeData, key));
      const feeling = isDelta
        ? (isNumber(row.value) ? `本次两种模式总分差值 ${formatDelta(row.value)}` : '<span class="pending-text">暂未同步</span>')
        : (isNumber(row.value) ? escapeHtml(humanizeVisibleText(getFeeling(modeData))) : '<span class="pending-text">暂未同步</span>');
      const liveLabel = `在新标签打开实机演示：${humanizeVisibleText(row.model.name)}`;
      return `<tr><td><span class="rank-number ${row.rank !== null && row.rank <= 3 ? 'top-rank' : ''}">${row.rank === null ? '—' : row.rank}</span></td><td><span class="model-cell"><i class="model-dot"></i>${escapeHtml(row.model.name)}</span></td><td class="${scoreClass}">${isDelta ? formatDelta(row.value) : formatScore(row.value)}</td><td>${rankDimensions[0]}</td><td>${rankDimensions[1]}</td><td>${rankDimensions[2]}</td><td>${feeling}</td><td><a class="live-entry" href="${escapeAttr(liveHref(row.model, state.rankMode))}" target="_blank" rel="noopener" title="在新标签打开实机演示" aria-label="${escapeAttr(liveLabel)}" data-live-entry="true">亲自操作</a></td></tr>`;
    }).join('');
  }

  function formatDimensionCell(modeData, key) {
    const value = readDimension(modeData, key);
    return isNumber(value) ? value.toFixed(1) : '<span class="pending-text">—</span>';
  }

  function formatDeltaDimensionCell(adversarialData, oneShotData, key) {
    const adversarial = readDimension(adversarialData, key);
    const oneShot = readDimension(oneShotData, key);
    if (!isNumber(adversarial) || !isNumber(oneShot)) return '<span class="pending-text">—</span>';
    const delta = adversarial - oneShot;
    const className = delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : 'delta-flat';
    return `<span class="${className}">${formatDelta(delta)}</span>`;
  }

  function getFeeling(modeData) {
    return modeData.feeling || modeData.summary || '已完成';
  }

  function showLiveCommandHelp() {
    const note = $('#live-command-note');
    note.textContent = '现场操作需要先双击“启动实机演示”，再打开现场操作导演台。';
    note.hidden = false;
    window.clearTimeout(showLiveCommandHelp.timer);
    showLiveCommandHelp.timer = window.setTimeout(() => { note.hidden = true; }, 5200);
  }

  function renderWall() {
    const sceneLabel = getSceneLabel(state.wallScene);
    $('#wall-grid').innerHTML = sortedModels(state.wallMode).map((model) => {
      const modeData = getModeData(model, state.wallMode);
      const entry = getSceneEntry(modeData, state.wallScene);
      const score = getTotal(modeData);
      return `<article class="wall-card"><div class="wall-card-head"><span class="wall-model-name" title="${escapeAttr(model.name)}">${escapeHtml(model.name)}</span><span class="wall-score">${formatScore(score)}</span></div>${renderShot(entry, 'wall-shot', `${model.name} · ${sceneLabel}`)}<div class="wall-card-foot"><span>${escapeHtml(modeLabel(state.wallMode))}</span><span>${escapeHtml(sceneLabel)}</span></div></article>`;
    }).join('');
  }

  function renderCompare() {
    const model = state.data.models.find((candidate) => candidate.id === state.compareModel) || state.data.models[0];
    if (!model) {
      $('#compare-grid').innerHTML = '<div class="empty-state"><div><strong>暂无模型数据</strong>等待评测结果载入</div></div>';
      return;
    }
    const sceneLabel = getSceneLabel(state.compareScene);
    $('#compare-grid').innerHTML = ['oneShot', 'adversarial'].map((mode) => {
      const modeData = getModeData(model, mode);
      const entry = getSceneEntry(modeData, state.compareScene);
      return `<article class="compare-panel"><div class="compare-panel-head"><strong>${escapeHtml(modeLabel(mode))}</strong><span class="compare-score">${formatScore(getTotal(modeData))}</span></div>${renderShot(entry, 'compare-shot', `${model.name} · ${modeLabel(mode)} · ${sceneLabel}`)}<div class="compare-caption"><span>${escapeHtml(model.name)}</span><span>${escapeHtml(sceneLabel)}</span></div></article>`;
    }).join('');
  }

  function renderDetail() {
    const model = state.data.models.find((candidate) => candidate.id === state.detailModel) || state.data.models[0];
    if (!model) return;
    const modeData = getModeData(model, state.detailMode);
    const total = getTotal(modeData);
    const strengths = humanizeVisibleText(modeData.strengths || modeData.pros || '暂未同步');
    const weaknesses = humanizeVisibleText(modeData.weaknesses || modeData.cons || '暂未同步');
    const feeling = humanizeVisibleText(modeData.feeling || modeData.summary || '暂未形成真实使用体感');
    $('#detail-grid').innerHTML = `<article class="detail-summary"><div><span class="badge ${isNumber(total) ? 'badge-blue' : 'badge-pending'}">${isNumber(total) ? '已完成' : '暂未同步'}</span><h3>${escapeHtml(model.name)}</h3><p>${escapeHtml(modeLabel(state.detailMode))} · 使用 ${escapeHtml(model.harness)}</p></div><div class="feeling">${escapeHtml(feeling)}</div></article><article class="detail-score-panel"><h3>六项评分 · ${isNumber(total) ? `${total.toFixed(1)} / 100` : '等待评分'}</h3><div class="score-list">${state.data.dimensions.map((dimension) => {
      const value = readDimension(modeData, dimension.key);
      const percentage = isNumber(value) ? Math.max(0, Math.min(100, (value / dimension.max) * 100)) : 0;
      return `<div class="score-row"><span class="score-row-label">${escapeHtml(displayDimensionLabel(dimension))}</span><div class="score-track"><div class="score-fill" style="width:${percentage}%"></div></div><span class="score-row-value">${isNumber(value) ? `${value.toFixed(1)} / ${dimension.max}` : '暂未同步'}</span></div>`;
    }).join('')}</div><div class="detail-notes"><div class="note-box"><strong>做得好的地方</strong><p>${escapeHtml(strengths)}</p></div><div class="note-box"><strong>还可以更好</strong><p>${escapeHtml(weaknesses)}</p></div></div></article>`;
  }

  function bindEvents() {
    $$('.mode-button').forEach((button) => button.addEventListener('click', () => {
      state.rankMode = button.dataset.mode;
      syncRankControls();
      renderOverview();
      renderLeaderboard();
    }));
    $$('.rank-tab').forEach((button) => button.addEventListener('click', () => {
      state.rankMode = button.dataset.rank;
      syncRankControls();
      renderOverview();
      renderLeaderboard();
    }));
    $$('.wall-mode').forEach((button) => button.addEventListener('click', () => {
      state.wallMode = button.dataset.mode;
      $$('.wall-mode').forEach((item) => item.classList.toggle('is-active', item === button));
      renderSelects();
      renderWall();
    }));
    $$('.detail-mode').forEach((button) => button.addEventListener('click', () => {
      state.detailMode = button.dataset.mode;
      $$('.detail-mode').forEach((item) => item.classList.toggle('is-active', item === button));
      renderSelects();
      renderDetail();
    }));
    $('#wall-scene').addEventListener('change', (event) => { state.wallScene = event.target.value; renderWall(); });
    $('#compare-scene').addEventListener('change', (event) => { state.compareScene = event.target.value; renderCompare(); });
    $('#compare-model').addEventListener('change', (event) => { state.compareModel = event.target.value; renderCompare(); });
    $('#detail-model').addEventListener('change', (event) => { state.detailModel = event.target.value; renderDetail(); });
    $('#refresh-data').addEventListener('click', loadData);
    document.addEventListener('click', (event) => {
      const liveEntry = event.target.closest('[data-live-entry]');
      if (liveEntry && window.location.protocol === 'file:') {
        showLiveCommandHelp();
      }
    });
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-image]');
      if (target) openLightbox(target.dataset.image, target.dataset.caption);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.closest('[data-image]')) {
        const target = event.target.closest('[data-image]');
        openLightbox(target.dataset.image, target.dataset.caption);
      }
      if (event.key === 'Escape') closeLightbox();
    });
    $('#lightbox-close').addEventListener('click', closeLightbox);
    $('#lightbox').addEventListener('click', (event) => { if (event.target.id === 'lightbox') closeLightbox(); });
  }

  function openLightbox(image, caption) {
    $('#lightbox-image').src = image;
    $('#lightbox-caption').textContent = caption || '截图预览';
    $('#lightbox').classList.add('is-open');
    $('#lightbox').setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    $('#lightbox').classList.remove('is-open');
    $('#lightbox').setAttribute('aria-hidden', 'true');
    $('#lightbox-image').removeAttribute('src');
  }

  bindEvents();
  loadData();
})();

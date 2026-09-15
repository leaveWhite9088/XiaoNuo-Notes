(() => {
  'use strict';

  const MODE_LABELS = {
    'one-shot': '一次性指令直出',
    adversarial: '对抗性审查多轮结果'
  };
  const MODEL_ORDER = [
    'claude-opus-5',
    'deepseek-v4.1-flash',
    'glm-5.3',
    'gpt-5.6-sol',
    'gpt-6-astra',
    'grok-4.6',
    'kimi-k3',
    'minimax-m3',
    'qwen-3.8-flash',
    'qwen-3.8-max'
  ];
  const DIMENSIONS = [
    { key: 'visual', label: '视觉还原', max: 35 },
    { key: 'core', label: '核心流程', max: 20 },
    { key: 'interaction', label: '操作完成度', max: 15 },
    { key: 'stability', label: '稳定性', max: 10 },
    { key: 'content', label: '内容与视频真实性', max: 10 },
    { key: 'engineering', label: '代码质量', max: 10 }
  ];
  const DEFAULT_TIPS = [
    '先看首页首屏，观察导航、视频卡和信息密度。',
    '尝试搜索、切换分类，再返回首页，感受状态是否连续。',
    '进入视频详情，点击播放、暂停和继续，确认内容是否真的在动。'
  ];

  const state = {
    catalog: [],
    results: null,
    tips: {},
    token: null,
    selectedModelId: null,
    selectedMode: 'one-shot',
    activeSampleId: null,
    activeFrontUrl: null,
    catalogAvailable: false,
    busy: false,
    heartbeatTimer: null,
    heartbeatSampleId: null,
    toastTimer: null
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function modeLabel(mode) {
    return MODE_LABELS[mode] || MODE_LABELS['one-shot'];
  }

  function normalizeMode(mode) {
    return mode === 'adversarial' ? 'adversarial' : 'one-shot';
  }

  function syncSelectionUrl() {
    if (!window.history?.replaceState || !state.selectedModelId) return;
    const url = new URL(window.location.href);
    url.searchParams.set('model', state.selectedModelId);
    url.searchParams.set('mode', state.selectedMode);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function sampleModelId(sample) {
    if (sample.modelId) return sample.modelId;
    const separator = String(sample.sampleId || '').indexOf('--');
    return separator >= 0 ? String(sample.sampleId).slice(separator + 2) : String(sample.sampleId || '');
  }

  function sampleMode(sample) {
    return normalizeMode(sample.mode || String(sample.sampleId || '').split('--')[0]);
  }

  function normalizeSample(sample) {
    const mode = sampleMode(sample);
    const modelId = sampleModelId(sample);
    return {
      sampleId: sample.sampleId || `${mode}--${modelId}`,
      modelId,
      modelName: sample.modelName || modelId,
      mode,
      modeLabel: modeLabel(mode)
    };
  }

  function normalizeResults(raw) {
    return raw && Array.isArray(raw.models) ? raw : null;
  }

  function embeddedResults() {
    return normalizeResults(window.__EVALUATION_RESULTS__);
  }

  async function fetchJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function loadResults() {
    const embedded = embeddedResults();
    if (embedded) state.results = embedded;
    const candidates = [
      './data/results.json',
      '/data/results.json',
      '/evaluation/data/results.json'
    ];
    for (const candidate of candidates) {
      try {
        const latest = normalizeResults(await fetchJson(candidate));
        if (latest) state.results = latest;
        break;
      } catch {
        // 现场页可以使用随页面加载的结果副本，网络结果不是硬依赖。
      }
    }
  }

  function addTips(target, value) {
    if (!value) return;
    const list = Array.isArray(value) ? value : value.tips;
    if (Array.isArray(list) && list.length) target.push(...list.filter(Boolean).slice(0, 3).map(String));
  }

  function normalizeTips(raw) {
    const tips = {};
    const items = Array.isArray(raw) ? raw : raw?.items;
    if (Array.isArray(items)) {
      items.forEach((item) => {
        const key = item.sampleId || `${item.mode || ''}--${item.modelId || ''}`;
        if (key) tips[key] = item.tips || item;
      });
      return tips;
    }
    const source = raw?.samples || raw?.tips || raw;
    if (source && typeof source === 'object') {
      Object.entries(source).forEach(([key, value]) => { tips[key] = value; });
    }
    return tips;
  }

  async function loadTips() {
    const candidates = [
      './data/live-tips.json',
      './results/live-tips.json',
      '/data/live-tips.json',
      '/results/live-tips.json',
      '/evaluation/data/live-tips.json',
      '/evaluation/results/live-tips.json'
    ];
    for (const candidate of candidates) {
      try {
        state.tips = normalizeTips(await fetchJson(candidate));
        return;
      } catch {
        // 后端尚未提供建议文件时使用通用现场操作提示。
      }
    }
  }

  function buildFallbackCatalog() {
    const models = state.results?.models || [];
    return models.map((model) => ['one-shot', 'adversarial'].map((mode) => normalizeSample({
      sampleId: `${mode}--${model.id}`,
      modelId: model.id,
      modelName: model.name,
      mode
    }))).flat();
  }

  async function loadCatalog() {
    try {
      const payload = await fetchJson('/api/live/catalog');
      if (!Array.isArray(payload.samples) || !payload.samples.length) throw new Error('empty catalog');
      state.catalog = payload.samples.map(normalizeSample);
      state.token = payload.token || null;
      state.catalogAvailable = Boolean(state.token);
      $('#service-help').hidden = state.catalogAvailable;
    } catch {
      state.catalog = buildFallbackCatalog();
      state.token = null;
      state.catalogAvailable = false;
      $('#service-help').hidden = false;
      setStatus('现场服务还没启动', 'failed');
    }
    selectFromUrl();
    renderAll();
  }

  function selectFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const requestedModel = params.get('model');
    const requestedMode = normalizeMode(params.get('mode'));
    const modelIds = new Set(state.catalog.map((sample) => sample.modelId));
    const firstRanked = rankedScores(requestedMode)[0]?.sample?.modelId;
    state.selectedModelId = modelIds.has(requestedModel) ? requestedModel : (firstRanked || state.catalog[0]?.modelId || null);
    state.selectedMode = state.catalog.some((sample) => sample.modelId === state.selectedModelId && sample.mode === requestedMode)
      ? requestedMode
      : 'one-shot';
    syncSelectionUrl();
  }

  function selectedSample() {
    return state.catalog.find((sample) => sample.modelId === state.selectedModelId && sample.mode === state.selectedMode) || null;
  }

  function resultModel(modelId) {
    return state.results?.models?.find((model) => model.id === modelId) || null;
  }

  function scoreFor(modelId, mode) {
    const model = resultModel(modelId);
    return model?.[mode === 'one-shot' ? 'oneShot' : 'adversarial'] || null;
  }

  function scoreTotal(score) {
    if (isNumber(score?.total)) return score.total;
    const values = DIMENSIONS.map((dimension) => score?.scores?.[dimension.key]);
    return values.every(isNumber) ? values.reduce((sum, value) => sum + value, 0) : null;
  }

  function rankedScores(mode) {
    const entries = state.catalog
      .filter((sample) => sample.mode === mode)
      .map((sample) => ({ sample, total: scoreTotal(scoreFor(sample.modelId, mode)) }))
      .sort((left, right) => {
        if (isNumber(left.total) && !isNumber(right.total)) return -1;
        if (!isNumber(left.total) && isNumber(right.total)) return 1;
        if (!isNumber(left.total) && !isNumber(right.total)) return 0;
        return right.total - left.total;
      });
    let rank = 0;
    let previous = null;
    entries.forEach((entry, index) => {
      if (!isNumber(entry.total)) entry.rank = null;
      else {
        if (index === 0 || entry.total !== previous) rank = index + 1;
        entry.rank = rank;
        previous = entry.total;
      }
    });
    return entries;
  }

  function sortedModelIds(mode) {
    return rankedScores(mode).map((entry) => entry.sample.modelId);
  }

  function averageTotal(mode) {
    const values = rankedScores(mode).map((entry) => entry.total).filter(isNumber);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  function averageDimension(mode, key) {
    const values = rankedScores(mode).map((entry) => scoreFor(entry.sample.modelId, mode)?.scores?.[key]).filter(isNumber);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  function formatNumber(value) {
    return isNumber(value) ? value.toFixed(1) : '—';
  }

  function formatSigned(value) {
    if (!isNumber(value)) return '—';
    return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
  }

  function gradeFor(total) {
    if (!isNumber(total)) return { label: '—', className: '' };
    if (total >= 85) return { label: 'S', className: 'grade-s' };
    if (total >= 78) return { label: 'A', className: 'grade-a' };
    if (total >= 70) return { label: 'B', className: 'grade-b' };
    if (total >= 60) return { label: 'C', className: 'grade-c' };
    return { label: 'D', className: 'grade-d' };
  }

  function tipsFor(sample) {
    const keys = [sample.sampleId, `${sample.mode}--${sample.modelId}`, sample.modelId];
    const result = [];
    for (const key of keys) addTips(result, state.tips[key]);
    if (!result.length) result.push(...DEFAULT_TIPS);
    return result.slice(0, 3);
  }

  function renderModelList() {
    const ids = sortedModelIds(state.selectedMode);
    MODEL_ORDER.forEach((id) => {
      if (!ids.includes(id) && state.catalog.some((sample) => sample.modelId === id)) ids.push(id);
    });
    $('#sample-count').textContent = `${ids.length} / 10`;
    $('#model-list').innerHTML = ids.map((modelId) => {
      const sample = state.catalog.find((candidate) => candidate.modelId === modelId);
      const score = scoreTotal(scoreFor(modelId, state.selectedMode));
      return `<button class="model-choice ${modelId === state.selectedModelId ? 'is-active' : ''}" data-model-id="${escapeHtml(modelId)}" type="button"><span class="model-choice-name">${escapeHtml(humanizeVisibleText(sample?.modelName || modelId))}</span><span class="model-choice-score ${isNumber(score) ? '' : 'is-empty'}">${formatNumber(score)}</span></button>`;
    }).join('');
    $$('.model-choice').forEach((button) => button.addEventListener('click', () => switchSelection(button.dataset.modelId, state.selectedMode)));
  }

  function renderSelection() {
    const sample = selectedSample();
    $('#selection-title').textContent = sample ? humanizeVisibleText(`${sample.modelName} · ${sample.modeLabel}`) : '暂无可选模型';
    $$('.live-mode-button').forEach((button) => button.classList.toggle('is-active', button.dataset.mode === state.selectedMode));
  }

  function renderScorePanel() {
    const sample = selectedSample();
    const score = sample ? scoreFor(sample.modelId, sample.mode) : null;
    const total = scoreTotal(score);
    const ranked = sample ? rankedScores(sample.mode) : [];
    const ranking = ranked.find((entry) => entry.sample.modelId === sample?.modelId);
    const grade = gradeFor(total);
    $('#score-model').textContent = humanizeVisibleText(sample?.modelName || '尚未选择模型');
    $('#score-mode').textContent = humanizeVisibleText(sample?.modeLabel || '—');
    $('#score-harness').textContent = `开发工具：${resultModel(sample?.modelId)?.harness || '未记录'}`;
    $('#score-total').textContent = isNumber(total) ? total.toFixed(1) : '—';
    $('#score-rank').textContent = ranking?.rank ? `第 ${ranking.rank} 名 / 共 ${ranked.length}` : '尚未评分';
    const gradeElement = $('#score-grade');
    gradeElement.textContent = grade.label;
    gradeElement.className = `grade-badge ${grade.className}`;
    const average = averageTotal(sample?.mode);
    $('#score-average').textContent = `相对同方式平均值 ${formatSigned(isNumber(total) && isNumber(average) ? total - average : null)}`;
    const dimensions = state.results?.dimensions?.length ? state.results.dimensions : DIMENSIONS;
    $('#score-dimensions').innerHTML = dimensions.map((dimension) => {
      const value = score?.scores?.[dimension.key];
      const avg = averageDimension(sample?.mode, dimension.key);
      const percentage = isNumber(value) ? Math.max(0, Math.min(100, (value / dimension.max) * 100)) : 0;
      const label = humanizeVisibleText({ core: '核心流程', interaction: '操作完成度', engineering: '代码质量' }[dimension.key] || dimension.label);
      return `<div class="score-dimension"><span class="dimension-label">${escapeHtml(label)}</span><div class="dimension-bar"><span style="width:${percentage}%"></span></div><span class="dimension-value">${formatNumber(value)} / ${dimension.max}<small>均值 ${formatSigned(isNumber(value) && isNumber(avg) ? value - avg : null)}</small></span></div>`;
    }).join('');
    $('#score-strengths').textContent = humanizeVisibleText(score?.strengths || '评分资料暂不可用');
    $('#score-weaknesses').textContent = humanizeVisibleText(score?.weaknesses || '评分资料暂不可用');
    let feeling = document.querySelector('#score-feeling');
    if (!feeling) {
      const notes = document.querySelector('.score-notes');
      if (notes) {
        const note = document.createElement('div');
        note.className = 'score-note';
        note.innerHTML = '<strong>真实体感</strong><p id="score-feeling"></p>';
        notes.appendChild(note);
        feeling = note.querySelector('#score-feeling');
      }
    }
    if (feeling) feeling.textContent = humanizeVisibleText(score?.feeling || score?.summary || '暂未形成真实使用体感');
    $('#score-tips-list').innerHTML = tipsFor(sample || { sampleId: '', modelId: '', mode: state.selectedMode }).map((tip) => `<li>${escapeHtml(humanizeVisibleText(tip))}</li>`).join('');
  }

  function renderAll() {
    renderModelList();
    renderSelection();
    renderScorePanel();
  }

  function setStatus(message, kind = '') {
    const element = $('#status-text');
    element.textContent = humanizeVisibleText(message);
    element.className = `status-line ${kind ? `is-${kind}` : ''}`;
  }

  function showToast(message) {
    const toast = $('#live-toast');
    toast.textContent = humanizeVisibleText(message);
    toast.classList.add('is-visible');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  }

  function setBusy(value) {
    state.busy = value;
    ['#previous-sample', '#next-sample', '#start-live', '#refresh-live', '#stop-live'].forEach((selector) => { $(selector).disabled = value; });
    $$('.live-mode-button, .model-choice').forEach((element) => { element.disabled = value; });
  }

  function liveHeaders() {
    return { 'content-type': 'application/json', 'x-live-token': state.token || '' };
  }

  async function postLive(path, body) {
    const response = await fetch(path, { method: 'POST', headers: liveHeaders(), body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json().catch(() => ({}));
  }

  async function getLiveStatus(sampleId) {
    const query = sampleId ? `?sampleId=${encodeURIComponent(sampleId)}` : '';
    try {
      return await fetchJson(`/api/live/status${query}`);
    } catch (firstError) {
      if (!sampleId) throw firstError;
      try {
        return await fetchJson(`/api/live/status/${encodeURIComponent(sampleId)}`);
      } catch {
        throw firstError;
      }
    }
  }

  function normalizedStatus(payload) {
    const raw = String(payload?.status || payload?.state || payload?.phase || '').toLowerCase();
    const activeSampleId = payload?.activeSampleId || null;
    if (['ready', 'running', 'live'].includes(raw) && payload?.frontUrl) return { state: 'ready', frontUrl: payload.frontUrl, activeSampleId, raw };
    if (['failed', 'error', 'dead'].includes(raw)) return { state: 'failed', activeSampleId, message: payload?.message || payload?.error || '现场服务没有成功启动', raw };
    if (['stopped', 'idle', 'closed', 'done'].includes(raw)) return { state: 'stopped', activeSampleId, raw };
    return { state: 'working', activeSampleId, message: payload?.message || '正在准备真实页面', raw };
  }

  async function pollUntilReady(sampleId) {
    for (let attempt = 0; attempt < 720; attempt += 1) {
      const current = normalizedStatus(await getLiveStatus(sampleId));
      if (current.activeSampleId && current.activeSampleId !== sampleId) {
        throw new Error(`后台正在准备另一件作品（${current.activeSampleId}），无法继续当前作品`);
      }
      if (current.state === 'ready') return current;
      if (current.state === 'failed') throw new Error(current.message);
      setStatus(current.message || '正在准备真实页面', 'working');
      await delay(1000);
    }
    throw new Error('准备时间过长，请刷新后再试');
  }

  async function waitUntilStopped(sampleId) {
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const current = normalizedStatus(await getLiveStatus(sampleId));
      if (current.state === 'stopped' || current.state === 'failed') return current;
      await delay(500);
    }
    throw new Error('停止现场作品超时，未确认服务已空闲');
  }

  async function cleanupRemoteAfterFailure(sampleId) {
    clearHeartbeat();
    await postLive('/api/live/stop', {});
    return waitUntilStopped(sampleId);
  }

  function clearHeartbeat() {
    if (state.heartbeatTimer) window.clearInterval(state.heartbeatTimer);
    state.heartbeatTimer = null;
    state.heartbeatSampleId = null;
  }

  function startHeartbeat(sampleId) {
    if (state.heartbeatTimer && state.heartbeatSampleId === sampleId) return;
    clearHeartbeat();
    state.heartbeatSampleId = sampleId;
    state.heartbeatTimer = window.setInterval(() => {
      postLive('/api/live/heartbeat', {}).catch(() => {});
    }, 10000);
  }

  function clearFrame() {
    const frame = $('#live-frame');
    frame.hidden = true;
    frame.removeAttribute('src');
    $('#frame-fallback').hidden = true;
    $('#standalone-link').href = '#';
    $('#stage-placeholder').hidden = false;
  }

  function mountFrame(frontUrl) {
    if (!frontUrl) throw new Error('现场服务没有返回可打开的作品地址');
    state.activeFrontUrl = frontUrl;
    const frame = $('#live-frame');
    frame.src = frontUrl;
    frame.hidden = false;
    $('#stage-placeholder').hidden = true;
    $('#frame-fallback').hidden = false;
    $('#standalone-link').href = frontUrl;
    $('#last-updated').textContent = `已打开真实页面 · ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  async function stopCurrent(options = {}) {
    clearHeartbeat();
    const sampleId = state.activeSampleId || selectedSample()?.sampleId;
    if (!state.catalogAvailable || !sampleId) {
      state.activeSampleId = null;
      state.activeFrontUrl = null;
      clearFrame();
      if (!options.silent) setStatus('已停止，可选择下一个模型');
      return true;
    }
    setStatus('正在停止当前作品', 'working');
    try {
      const remote = normalizedStatus(await getLiveStatus());
      const remoteSampleId = remote.activeSampleId || sampleId;
      if (remote.state !== 'stopped' && remote.state !== 'failed') {
        await postLive('/api/live/stop', {});
        await waitUntilStopped(remoteSampleId);
      }
      state.activeSampleId = null;
      state.activeFrontUrl = null;
      clearFrame();
      if (!options.silent) setStatus('已停止，可选择下一个模型');
      return true;
    } catch (error) {
      setStatus(`停止没有完成：${error.message}`, 'failed');
      if (!options.silent) showToast(`停止没有完成：${error.message}`);
      throw error;
    }
  }

  async function restoreRemoteState() {
    if (!state.catalogAvailable) return;
    const remote = normalizedStatus(await getLiveStatus());
    const activeSampleId = remote.activeSampleId;
    if (remote.state === 'stopped' || !activeSampleId) {
      state.activeSampleId = null;
      state.activeFrontUrl = null;
      clearFrame();
      return;
    }
    const sample = state.catalog.find((candidate) => candidate.sampleId === activeSampleId);
    if (!sample) {
      state.activeSampleId = activeSampleId;
      try {
        await cleanupRemoteAfterFailure(activeSampleId);
        state.activeSampleId = null;
        state.activeFrontUrl = null;
        clearFrame();
        setStatus('现场状态对应的作品不在当前目录', 'failed');
      } catch (cleanupError) {
        setStatus('作品仍在收尾，请稍后刷新', 'failed');
        showToast(`作品仍在收尾，请稍后刷新：${cleanupError.message}`);
      }
      return;
    }
    state.selectedModelId = sample.modelId;
    state.selectedMode = sample.mode;
    syncSelectionUrl();
    renderAll();
    state.activeSampleId = activeSampleId;
    if (remote.state === 'ready') {
      state.activeFrontUrl = remote.frontUrl;
      mountFrame(remote.frontUrl);
      setStatus('作品已准备好，可以开始操作', 'ready');
      startHeartbeat(activeSampleId);
      return;
    }
    setStatus('正在恢复现场作品', 'working');
    startHeartbeat(activeSampleId);
    try {
      const ready = await pollUntilReady(activeSampleId);
      mountFrame(ready.frontUrl);
      setStatus('作品已准备好，可以开始操作', 'ready');
      startHeartbeat(activeSampleId);
    } catch (error) {
      try {
        await cleanupRemoteAfterFailure(activeSampleId);
        state.activeSampleId = null;
        state.activeFrontUrl = null;
        clearFrame();
        setStatus(error.message || '现场作品恢复失败', 'failed');
      } catch (cleanupError) {
        setStatus('作品仍在收尾，请稍后刷新', 'failed');
        showToast(`作品仍在收尾，请稍后刷新：${cleanupError.message}`);
      }
    }
  }

  async function startCurrent() {
    if (state.busy) return;
    const sample = selectedSample();
    if (!sample) {
      showToast('当前没有可操作的模型');
      return;
    }
    let startSubmitted = false;
    let startedSampleId = null;
    let stopCompleted = !state.catalogAvailable;
    setBusy(true);
    try {
      if (state.catalogAvailable) {
        await stopCurrent({ silent: true });
        stopCompleted = true;
      }
      if (!state.catalogAvailable) {
        setStatus('现场服务还没启动', 'failed');
        $('#service-help').hidden = false;
        showToast('请先双击“启动实机演示”');
        return;
      }
      setStatus('正在启动现场作品', 'working');
      await postLive('/api/live/start', { sampleId: sample.sampleId });
      startSubmitted = true;
      startedSampleId = sample.sampleId;
      state.activeSampleId = sample.sampleId;
      startHeartbeat(sample.sampleId);
      const ready = await pollUntilReady(sample.sampleId);
      mountFrame(ready.frontUrl);
      setStatus('作品已准备好，可以开始操作', 'ready');
    } catch (error) {
      clearHeartbeat();
      if (startSubmitted && state.catalogAvailable) {
        try {
          await cleanupRemoteAfterFailure(startedSampleId || sample.sampleId);
          state.activeSampleId = null;
          state.activeFrontUrl = null;
          clearFrame();
          setStatus(error.message || '作品启动失败', 'failed');
          showToast('这次没有启动成功，可以刷新后重试');
        } catch (cleanupError) {
          setStatus('作品仍在收尾，请稍后刷新', 'failed');
          showToast(`作品仍在收尾，请稍后刷新：${cleanupError.message}`);
        }
      } else if (!stopCompleted && state.catalogAvailable) {
        setStatus('作品仍在收尾，请稍后刷新', 'failed');
        showToast(`作品仍在收尾，请稍后刷新：${error.message}`);
      } else if (state.activeSampleId) {
        setStatus('作品仍在收尾，请稍后刷新', 'failed');
        showToast(`作品仍在收尾，请稍后刷新：${error.message}`);
      } else {
        state.activeFrontUrl = null;
        clearFrame();
        setStatus(error.message || '作品启动失败', 'failed');
        showToast('这次没有启动成功，可以刷新后重试');
      }
    } finally {
      setBusy(false);
    }
  }

  async function switchSelection(modelId, mode) {
    if (state.busy) return;
    state.selectedModelId = modelId;
    state.selectedMode = normalizeMode(mode);
    syncSelectionUrl();
    renderAll();
    if (state.activeSampleId) await startCurrent();
  }

  async function moveSelection(offset) {
    const ids = sortedModelIds(state.selectedMode);
    const current = Math.max(0, ids.indexOf(state.selectedModelId));
    const next = (current + offset + ids.length) % ids.length;
    if (ids.length) await switchSelection(ids[next], state.selectedMode);
  }

  async function refreshCurrent() {
    if (state.busy) return;
    if (!state.activeSampleId) {
      setStatus('正在刷新现场目录', 'working');
      await loadCatalog();
      if (state.catalogAvailable) await restoreRemoteState();
      else setStatus('现场服务还没启动', 'failed');
      return;
    }
    setBusy(true);
    try {
      const current = normalizedStatus(await getLiveStatus(state.activeSampleId));
      if (current.state === 'ready') {
        mountFrame(current.frontUrl);
        setStatus('作品已准备好，可以开始操作', 'ready');
      } else if (current.state === 'failed') {
        setStatus(current.message, 'failed');
      } else if (current.state === 'stopped') {
        state.activeSampleId = null;
        state.activeFrontUrl = null;
        clearHeartbeat();
        clearFrame();
        setStatus('已停止，可选择下一个模型');
      } else {
        setStatus('作品仍在准备中', 'working');
      }
    } catch {
      setStatus('暂时无法读取现场状态', 'failed');
    } finally {
      setBusy(false);
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  }

  function bindScoreDrag() {
    const panel = $('#score-panel');
    const handle = $('#score-drag-handle');
    let drag = null;
    const release = () => {
      if (drag?.pointerId != null && handle.hasPointerCapture?.(drag.pointerId)) {
        try { handle.releasePointerCapture(drag.pointerId); } catch {}
      }
      drag = null;
      document.body.classList.remove('score-panel-dragging');
    };
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('#collapse-score')) return;
      const rect = panel.getBoundingClientRect();
      drag = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.setPointerCapture?.(event.pointerId);
      document.body.classList.add('score-panel-dragging');
      event.preventDefault();
    });
    window.addEventListener('pointermove', (event) => {
      if (!drag) return;
      if (event.buttons === 0) {
        release();
        return;
      }
      const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
      panel.style.left = `${Math.max(8, Math.min(maxLeft, event.clientX - drag.offsetX))}px`;
      panel.style.top = `${Math.max(8, Math.min(maxTop, event.clientY - drag.offsetY))}px`;
    });
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('blur', release);
    handle.addEventListener('lostpointercapture', release);
    document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  }

  function keepStageControlsClear() {
    const controls = $('.stage-controls');
    if (controls) controls.style.marginRight = window.innerWidth > 1050 ? '390px' : '0';
  }

  function bindEvents() {
    $$('.live-mode-button').forEach((button) => button.addEventListener('click', () => switchSelection(state.selectedModelId, button.dataset.mode)));
    $('#previous-sample').addEventListener('click', () => moveSelection(-1));
    $('#next-sample').addEventListener('click', () => moveSelection(1));
    $('#start-live').addEventListener('click', startCurrent);
    $('#refresh-live').addEventListener('click', refreshCurrent);
    $('#stop-live').addEventListener('click', async () => {
      if (state.busy) return;
      setBusy(true);
      try {
        await stopCurrent();
      } catch {
        // stopCurrent 已显示具体失败原因；保持现场状态，阻止后续启动。
      } finally {
        setBusy(false);
      }
    });
    $('#fullscreen-button').addEventListener('click', toggleFullscreen);
    $('#collapse-score').addEventListener('click', (event) => {
      event.stopPropagation();
      const panel = $('#score-panel');
      const collapsed = panel.classList.toggle('is-collapsed');
      event.currentTarget.textContent = collapsed ? '+' : '−';
      event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    });
    document.addEventListener('keydown', (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (event.key === 'ArrowLeft') moveSelection(-1);
      if (event.key === 'ArrowRight') moveSelection(1);
      if (event.key === 'Enter') startCurrent();
      if (event.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
    });
    document.addEventListener('fullscreenchange', () => {
      $('#fullscreen-button').textContent = document.fullscreenElement ? '退出全屏' : '进入全屏';
    });
    bindScoreDrag();
    keepStageControlsClear();
    window.addEventListener('resize', keepStageControlsClear);
  }

  async function init() {
    bindEvents();
    await Promise.all([loadResults(), loadTips()]);
    await loadCatalog();
    if (!state.catalog.length) {
      setStatus('暂时没有可选模型', 'failed');
      $('#service-help').hidden = false;
    } else if (!state.catalogAvailable) {
      setStatus('现场服务还没启动', 'failed');
    } else {
      await restoreRemoteState();
      if (!state.activeSampleId) setStatus('选择模型后，点击“一键启动”');
    }
  }

  init().catch(() => {
    setStatus('现场页面暂时无法准备', 'failed');
    $('#service-help').hidden = false;
  });
})();

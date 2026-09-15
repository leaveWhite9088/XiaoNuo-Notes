import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PROJECT_ROOT = '/Users/mumuxsy/Desktop/临时工作目录/video-260909-B站首页制作';
const VIEWPORT = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
const STORAGE_TYPES = 'local_storage,session_storage,indexeddb,cache_storage,service_workers';

function asError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function safeSegment(value, fallback) {
  const segment = String(value ?? '').trim();
  if (!segment) return fallback;
  return segment.replace(/[^\p{L}\p{N}._-]+/gu, '-');
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) continue;
    const key = argument.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    options[key] = argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[++index] : true;
  }
  return options;
}

function assertOptions(options) {
  const missing = ['frontUrl', 'mode', 'model', 'taskSpaceId'].filter((key) => !options[key]);
  if (missing.length) throw new Error(`缺少参数：${missing.map((key) => `--${key.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)}`).join(', ')}`);
  if (!['one-shot', 'adversarial'].includes(options.mode)) throw new Error('--mode 只能是 one-shot 或 adversarial');
}

async function currentUrl(page) {
  return page.evaluate(() => window.location.href);
}

async function pageMetrics(page) {
  return page.evaluate(() => {
    const brokenImages = [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length;
    const cardCount = document.querySelectorAll('a[href*="/video/"], [class*="card"], [class*="Card"]').length;
    const root = document.documentElement;
    return {
      brokenImages,
      cardCount,
      scrollOverflow: {
        horizontal: root.scrollWidth > window.innerWidth,
        vertical: root.scrollHeight > window.innerHeight,
        scrollWidth: root.scrollWidth,
        scrollHeight: root.scrollHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    };
  });
}

async function searchSelector(page) {
  return page.evaluate(() => {
    const selectors = [
      'input[type="search"]',
      'input[placeholder*="搜索"]',
      'header form input',
      'form input'
    ];
    for (const selector of selectors) {
      const elements = [...document.querySelectorAll(selector)];
      const index = elements.findIndex((element) => {
        const type = (element.getAttribute('type') || 'text').toLowerCase();
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return ['text', 'search'].includes(type)
          && !element.disabled
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity || 1) > 0
          && rect.width > 0
          && rect.height > 0;
      });
      if (index >= 0) return { selector, index };
    }
    const inputs = [...document.querySelectorAll('input')];
    const inputIndex = inputs.findIndex((element) => {
      const type = (element.getAttribute('type') || 'text').toLowerCase();
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return ['text', 'search'].includes(type)
        && !element.disabled
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0
        && rect.width > 0
        && rect.height > 0;
    });
    if (inputIndex >= 0) return { selector: 'input', index: inputIndex };
    const editables = [...document.querySelectorAll('[contenteditable="true"]')];
    const editableIndex = editables.findIndex((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return !element.getAttribute('aria-disabled')
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0
        && rect.width > 0
        && rect.height > 0;
    });
    if (editableIndex >= 0) return { selector: '[contenteditable="true"]', index: editableIndex };
    return null;
  });
}

function searchLocator(searchInput) {
  return `${searchInput.selector} >> nth=${searchInput.index}`;
}

async function markFirstVideoTarget(page) {
  return page.evaluate(() => {
    const marker = '[data-eval-video-target="true"]';
    document.querySelectorAll(marker).forEach((element) => element.removeAttribute('data-eval-video-target'));
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0
        && rect.width > 0
        && rect.height > 0;
    };
    const anchor = [...document.querySelectorAll('a[href*="/video/"]')].find(visible);
    const fallbackSelectors = [
      '[class*="video-card"]',
      '[class*="videoCard"]',
      '[class*="VideoCard"]',
      'article',
      '[class*="card"]'
    ];
    const fallbackCandidates = [];
    const seen = new Set();
    fallbackSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (!seen.has(element)) {
          seen.add(element);
          fallbackCandidates.push(element);
        }
      });
    });
    const fallback = fallbackCandidates.find((element) => {
      if (!visible(element)) return false;
      const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
      const hasImage = Boolean(element.querySelector('img, video'));
      const className = String(element.className || '').toLowerCase();
      const looksLikeVideo = /video|card/.test(className) && (hasImage || text.length >= 3);
      const hasMediaAndText = hasImage && text.length >= 3;
      return looksLikeVideo || hasMediaAndText;
    });
    const target = anchor || fallback;
    if (!target) return null;
    target.setAttribute('data-eval-video-target', 'true');
    const childAnchor = target.matches('a[href]') ? target : target.querySelector('a[href]');
    return {
      selector: marker,
      href: childAnchor?.href || target.getAttribute('href') || null,
      kind: anchor ? 'anchor' : 'programmatic-card'
    };
  });
}

async function exactGameLink(page) {
  return page.evaluate(() => {
    const candidates = [...document.querySelectorAll('button, a')];
    const element = candidates.find((candidate) => {
      const text = (candidate.textContent || '')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\s+/g, '')
        .trim();
      const rect = candidate.getBoundingClientRect();
      return text === '游戏' && text !== '游戏中心' && rect.width > 0 && rect.height > 0;
    });
    if (!element) return { found: false };
    element.click();
    return { found: true, text: (element.textContent || '').replace(/\s+/g, ' ').trim() };
  });
}

async function markHeaderAccountTarget(page) {
  return page.evaluate(() => {
    const marker = '[data-eval-account-target="true"]';
    document.querySelectorAll(marker).forEach((element) => element.removeAttribute('data-eval-account-target'));
    const candidates = [...document.querySelectorAll('header button, header a, header [role="button"], header img, header [class*="avatar"], header [class*="Avatar"]')];
    const positive = /个人中心|头像|登录|注册|账户|用户|profile|avatar|account|sign[ -]?in|log[ -]?in/i;
    const negative = /加载更多|更多视频|load more/i;
    const element = candidates.map((candidate) => candidate.closest('button, a, [role="button"]') || candidate).find((candidate) => {
      const label = `${candidate.textContent || ''} ${candidate.getAttribute('aria-label') || ''} ${candidate.getAttribute('title') || ''} ${candidate.getAttribute('alt') || ''} ${candidate.className || ''}`.replace(/\s+/g, ' ').trim();
      const rect = candidate.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && positive.test(label) && !negative.test(label);
    });
    if (!element) return { found: false };
    element.setAttribute('data-eval-account-target', 'true');
    return { found: true, selector: marker, label: (element.textContent || element.getAttribute('aria-label') || element.getAttribute('alt') || '').replace(/\s+/g, ' ').trim() };
  });
}

async function markMoreMenuTarget(page) {
  return page.evaluate(() => {
    const marker = '[data-eval-menu-target="true"]';
    document.querySelectorAll(marker).forEach((element) => element.removeAttribute('data-eval-menu-target'));
    const candidates = [...document.querySelectorAll('button, a, [role="button"]')];
    const words = /更多|菜单|展开|more|menu/i;
    const negative = /加载更多|更多视频|load more/i;
    const element = candidates.find((candidate) => {
      const label = `${candidate.textContent || ''} ${candidate.getAttribute('aria-label') || ''} ${candidate.getAttribute('title') || ''}`.replace(/\s+/g, ' ').trim();
      const rect = candidate.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && words.test(label) && !negative.test(label);
    });
    if (!element) return { found: false };
    element.setAttribute('data-eval-menu-target', 'true');
    return { found: true, selector: marker, label: (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim() };
  });
}

async function searchResultCount(page) {
  return page.evaluate(() => document.querySelectorAll('a[href*="/video/"], [class*="result"], [class*="Result"]').length);
}

async function inspectPlayback(page) {
  return page.evaluate(() => {
    const video = document.querySelector('video');
    if (!video) return { found: false, currentTime: null, paused: null, readyState: null };
    return {
      found: true,
      currentTime: Number.isFinite(video.currentTime) ? video.currentTime : null,
      paused: video.paused,
      readyState: video.readyState
    };
  });
}

async function configureViewport(page, evidence) {
  try {
    await page.cdp('Emulation.setDeviceMetricsOverride', VIEWPORT);
    const actual = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
    evidence.checks.viewport = {
      pass: actual.width === VIEWPORT.width && actual.height === VIEWPORT.height,
      requested: VIEWPORT,
      actual
    };
  } catch (error) {
    evidence.checks.viewport = { pass: false, reason: asError(error), requested: VIEWPORT };
  }
}

async function clearOriginStorage(page, origin, evidence) {
  try {
    await page.cdp('Storage.clearDataForOrigin', { origin, storageTypes: STORAGE_TYPES });
    evidence.checks.storage_clear = { pass: true, origin, storageTypes: STORAGE_TYPES };
  } catch (error) {
    evidence.checks.storage_clear = { pass: false, reason: asError(error), origin, storageTypes: STORAGE_TYPES };
  }
}

async function capture(page, screenshotPath, name, evidence) {
  try {
    await page.screenshot({ path: screenshotPath });
    const file = await stat(screenshotPath);
    evidence.screenshots[name] = { path: screenshotPath, bytes: file.size };
    return true;
  } catch (error) {
    evidence.screenshots[name] = { path: screenshotPath, error: asError(error) };
    return false;
  }
}

async function runStep(name, action, page, screenshotPath, evidence) {
  let actionResult;
  let actionError = null;
  try {
    actionResult = await action();
  } catch (error) {
    actionError = asError(error);
  }
  const screenshotOk = await capture(page, screenshotPath, name, evidence);
  const pass = !actionError && screenshotOk;
  evidence.checks[name] = pass
    ? { pass: true, ...(actionResult && typeof actionResult === 'object' ? actionResult : {}) }
    : { pass: false, reason: actionError || '截图保存失败', screenshotSaved: screenshotOk };
  return { actionResult, pass };
}

async function waitAfterNavigation(page) {
  await page.waitForLoadState();
  await page.waitForTimeout(700);
}

async function run(options) {
  assertOptions(options);
  const mode = String(options.mode);
  const model = safeSegment(options.model, 'unknown-model');
  const taskSpaceId = Number(options.taskSpaceId);
  if (!Number.isInteger(taskSpaceId)) throw new Error('--task-space-id 必须是数字');
  const frontUrl = String(options.frontUrl);
  const origin = new URL(frontUrl).origin;
  const outputMode = safeSegment(mode, 'unknown-mode');
  const assetsDir = path.join(PROJECT_ROOT, 'evaluation', 'assets', outputMode, model);
  const evidencePath = path.join(PROJECT_ROOT, 'evaluation', 'evidence', outputMode, `${model}.json`);
  await mkdir(assetsDir, { recursive: true });
  await mkdir(path.dirname(evidencePath), { recursive: true });

  const evidence = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    frontUrl,
    mode,
    model,
    taskSpaceId,
    page: 'p1',
    viewport: VIEWPORT,
    screenshots: {},
    checks: {},
    metrics: {},
    playback: null,
    errors: []
  };

  let task;
  let page;
  try {
    if (typeof globalThis.taskSpace !== 'function') throw new Error('当前运行环境没有 ego-browser taskSpace API');
    task = await globalThis.taskSpace(taskSpaceId);
    page = task.page('p1');
    await configureViewport(page, evidence);
    await clearOriginStorage(page, origin, evidence);

    const screenshotPath = (name) => path.join(assetsDir, `${name}.png`);

    await runStep('home', async () => {
      await page.goto(frontUrl);
      await waitAfterNavigation(page);
      const url = await currentUrl(page);
      const metrics = await pageMetrics(page);
      evidence.metrics.home = metrics;
      return { url, ...metrics };
    }, page, screenshotPath('home'), evidence);

    await runStep('feed', async () => {
      await page.evaluate(() => window.scrollTo({ top: Math.round(window.innerHeight * 0.78), left: 0, behavior: 'instant' }));
      await page.waitForTimeout(500);
      const metrics = await pageMetrics(page);
      evidence.metrics.feed = metrics;
      return metrics;
    }, page, screenshotPath('feed'), evidence);

    await runStep('hover', async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await page.waitForTimeout(350);
      const target = await markFirstVideoTarget(page);
      if (!target) throw new Error('未找到可见视频链接或程序化视频卡');
      await page.hover(target.selector, { label: '悬停首个视频卡' });
      await page.waitForTimeout(500);
      return target;
    }, page, screenshotPath('hover'), evidence);

    await runStep('menu', async () => {
      const account = await markHeaderAccountTarget(page);
      const target = account?.found ? account : await markMoreMenuTarget(page);
      if (!target?.found) throw new Error('未找到个人中心/头像/登录候选，也未找到可用的更多菜单控件');
      await page.hover(target.selector, { label: '悬停菜单候选' });
      await page.waitForTimeout(250);
      await page.click(target.selector, { label: '打开菜单候选' });
      await page.waitForTimeout(350);
      return { ...target, strategy: account?.found ? 'header-account' : 'more-control' };
    }, page, screenshotPath('menu'), evidence);

    let searchInput = null;
    await runStep('search-suggest', async () => {
      searchInput = await searchSelector(page);
      if (!searchInput) throw new Error('未找到搜索输入框');
      await page.fill(searchLocator(searchInput), '科技');
      await page.waitForTimeout(500);
      const suggestionCount = await page.evaluate(() => document.querySelectorAll('[role="listbox"] [role="option"], [class*="suggest"], [class*="Suggest"], [class*="search-item"]').length);
      return { ...searchInput, suggestionCount };
    }, page, screenshotPath('search-suggest'), evidence);

    await runStep('search-results', async () => {
      if (!searchInput) throw new Error('搜索建议步骤未找到输入框');
      const beforeUrl = await currentUrl(page);
      await page.press(searchLocator(searchInput), 'Enter');
      try {
        await page.waitForURL((nextUrl) => String(nextUrl) !== beforeUrl, { timeout: 2500 });
      } catch {
        await page.waitForTimeout(600);
      }
      await page.waitForTimeout(450);
      const afterUrl = await currentUrl(page);
      const resultCount = await searchResultCount(page);
      if (afterUrl === beforeUrl && resultCount === 0) throw new Error('回车后 URL 和结果数量均未变化');
      return { beforeUrl, afterUrl, resultCount };
    }, page, screenshotPath('search-results'), evidence);

    await runStep('category', async () => {
      await page.goto(frontUrl);
      await waitAfterNavigation(page);
      const result = await exactGameLink(page);
      if (!result.found) throw new Error('未找到精确文本“游戏”的 button 或 a');
      await page.waitForTimeout(700);
      const metrics = await pageMetrics(page);
      return { ...result, url: await currentUrl(page), ...metrics };
    }, page, screenshotPath('category'), evidence);

    await runStep('video', async () => {
      await page.goto(frontUrl);
      await waitAfterNavigation(page);
      const target = await markFirstVideoTarget(page);
      if (!target) throw new Error('未找到可见视频链接或程序化视频卡');
      const beforeUrl = await currentUrl(page);
      const beforeDetailState = await page.evaluate(() => {
        const heading = document.querySelector('h1, [class*="detail"], [class*="Detail"]');
        return {
          hasVideo: Boolean(document.querySelector('video')),
          hasPlayer: Boolean(document.querySelector('[class*="player"], [class*="Player"], [data-player]')),
          hasDetailHeading: Boolean(heading),
          detailHeading: (heading?.textContent || '').replace(/\s+/g, ' ').trim()
        };
      });
      await page.click(target.selector, { label: '打开首个视频卡' });
      try {
        await page.waitForURL((nextUrl) => String(nextUrl) !== beforeUrl, { timeout: 3500 });
      } catch {
        await page.waitForTimeout(700);
      }
      await page.waitForTimeout(500);
      const afterUrl = await currentUrl(page);
      const detailState = await page.evaluate(() => ({
        hasVideo: Boolean(document.querySelector('video')),
        hasPlayer: Boolean(document.querySelector('[class*="player"], [class*="Player"], [data-player]')),
        hasDetailHeading: Boolean(document.querySelector('h1, [class*="detail"], [class*="Detail"]')),
        detailHeading: (document.querySelector('h1, [class*="detail"], [class*="Detail"]')?.textContent || '').replace(/\s+/g, ' ').trim()
      }));
      const detailChanged = afterUrl !== beforeUrl
        || detailState.hasVideo !== beforeDetailState.hasVideo
        || detailState.hasPlayer !== beforeDetailState.hasPlayer
        || detailState.hasDetailHeading !== beforeDetailState.hasDetailHeading
        || detailState.detailHeading !== beforeDetailState.detailHeading;
      if (!detailChanged) {
        throw new Error('点击视频卡后 URL 和详情状态均未变化');
      }
      const before = await inspectPlayback(page);
      const playbackRequest = before.found ? await page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return { mutedRequested: false, playRequested: false };
        video.muted = true;
        const mutedRequested = video.muted === true;
        video.play().catch(() => {});
        return { mutedRequested, playRequested: true };
      }) : { mutedRequested: false, playRequested: false };
      const { mutedRequested, playRequested } = playbackRequest;
      await page.waitForTimeout(1200);
      const after = await inspectPlayback(page);
      evidence.playback = {
        href: target.href,
        target,
        beforeUrl,
        afterUrl,
        beforeDetailState,
        detailState,
        before,
        after,
        mutedRequested,
        playRequested,
        currentTimeDelta: before.currentTime !== null && after.currentTime !== null ? after.currentTime - before.currentTime : null,
        progressed: before.currentTime !== null && after.currentTime !== null ? after.currentTime > before.currentTime + 0.1 : false
      };
      const metrics = await pageMetrics(page);
      evidence.metrics.final = metrics;
      evidence.metrics.finalURL = await currentUrl(page);
      if (!before.found) throw new Error('详情页未找到 video 元素');
      return { href: target.href, target, url: evidence.metrics.finalURL, playback: evidence.playback, ...metrics };
    }, page, screenshotPath('video'), evidence);

    if (!evidence.metrics.finalURL) evidence.metrics.finalURL = await currentUrl(page);
  } catch (error) {
    evidence.errors.push({ stage: 'fatal', reason: asError(error) });
  }

  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ evidencePath, assetsDir, checks: evidence.checks, finalURL: evidence.metrics.finalURL || null }, null, 2));
  return evidence;
}

export { run };

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  run(parseArgs(process.argv.slice(2))).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

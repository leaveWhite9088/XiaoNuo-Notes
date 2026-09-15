/**
 * Dev V0 自检脚本：用无头浏览器跑通首页 -> hover -> 菜单 -> 搜索建议 -> 分区筛选
 * -> 视频详情 -> 实际播放 -> 返回首页 的完整主链路，逐项打印证据并截图。
 *
 * 用法（需先启动 3602 / 5602）: node selfcheck/selfcheck.mjs
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(DIR, 'shots');
const BASE = 'http://127.0.0.1:3602';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
const failedRequests = [];
page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText}`));
page.on('response', (r) => {
  if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
});

try {
  // 1. 首页加载
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.video-card:not(.video-card--skeleton)', { timeout: 15000 });
  const cardCount = await page.locator('.video-card:not(.video-card--skeleton)').count();
  const title = await page.title();
  check('首页可访问且信息流渲染', cardCount >= 20, `${cardCount} 张卡片, title=${title}`);

  // 封面是真实图片（自然宽度 > 0）
  const coverInfo = await page.evaluate(() => {
    const img = document.querySelector('.video-card__cover img');
    return img ? { src: img.getAttribute('src'), w: img.naturalWidth, h: img.naturalHeight } : null;
  });
  check('封面为真实图片（已解码）', Boolean(coverInfo && coverInfo.w > 100), JSON.stringify(coverInfo));
  await shot(page, '01-home');

  // 2. 卡片 hover：统计信息与稍后再看按钮浮出
  const firstCard = page.locator('.video-card').first();
  const beforeOpacity = await firstCard.locator('.video-card__stats').evaluate((el) => getComputedStyle(el).opacity);
  await firstCard.hover();
  await page.waitForTimeout(500);
  const afterOpacity = await firstCard.locator('.video-card__stats').evaluate((el) => getComputedStyle(el).opacity);
  const laterOpacity = await firstCard.locator('.video-card__later').evaluate((el) => getComputedStyle(el).opacity);
  check('卡片 hover 出现播放/弹幕统计与稍后再看', Number(beforeOpacity) < 0.1 && Number(afterOpacity) > 0.9 && Number(laterOpacity) > 0.9,
    `stats ${beforeOpacity} -> ${afterOpacity}, 稍后再看 ${laterOpacity}`);
  await shot(page, '02-card-hover');

  // 稍后再看点击 -> toast
  await firstCard.locator('.video-card__later').click();
  await page.waitForSelector('.video-card__toast', { timeout: 4000 });
  const toastText = await page.locator('.video-card__toast').first().innerText();
  check('稍后再看按钮可用（写入后端）', toastText.includes('稍后再看'), toastText);

  // 3. 顶栏「首页」悬浮菜单展开（全部分区）
  await page.locator('.header__link', { hasText: '首页' }).hover();
  await page.waitForSelector('.channel-menu', { timeout: 4000 });
  const menuItems = await page.locator('.channel-menu__item').count();
  check('顶栏菜单展开（全部分区）', menuItems >= 20, `${menuItems} 个分区入口`);
  await shot(page, '03-nav-menu');

  // 4. 头像悬浮面板
  await page.locator('.header__avatar').hover();
  await page.waitForSelector('.user-panel', { timeout: 4000 });
  const userName = await page.locator('.user-panel__name').innerText();
  check('头像悬浮面板展开', userName.length > 0, userName.replace(/\s+/g, ' '));

  // 5. 历史面板（走 /api/me/history）
  await page.locator('.header__entry', { hasText: '历史' }).hover();
  await page.waitForSelector('.mini-list', { timeout: 4000 });
  check('历史悬浮面板展开', true, await page.locator('.mini-list__header').innerText().then((t) => t.replace(/\s+/g, ' ')));
  await page.mouse.move(800, 600);

  // 6. 搜索建议
  await page.locator('.search-box__input').click();
  await page.waitForSelector('.suggest-panel', { timeout: 4000 });
  await page.waitForSelector('.hot-item', { timeout: 6000 });
  const hotCount = await page.locator('.hot-item').count();
  check('搜索框聚焦展示 bilibili 热搜', hotCount > 0, `${hotCount} 条热搜`);
  await page.locator('.search-box__input').fill('猫');
  await page.waitForSelector('.suggest-item', { timeout: 6000 });
  const suggestCount = await page.locator('.suggest-item').count();
  const firstSuggest = await page.locator('.suggest-item').first().innerText();
  check('输入触发搜索建议', suggestCount > 0, `${suggestCount} 条, 首条: ${firstSuggest.replace(/\s+/g, ' ').slice(0, 40)}`);
  await shot(page, '04-search-suggest');

  // 回车进入搜索结果页
  await page.locator('.search-box__input').press('Enter');
  await page.waitForURL('**/search?keyword=*', { timeout: 6000 });
  await page.waitForSelector('.video-card:not(.video-card--skeleton), .video-grid__empty', { timeout: 8000 });
  const searchTotal = await page.locator('.search-page__total').innerText();
  const searchHits = await page.locator('.video-card:not(.video-card--skeleton)').count();
  check('搜索结果页返回结果', searchHits > 0, `${searchTotal.replace(/\s+/g, ' ')} / 渲染 ${searchHits} 张卡片`);
  await shot(page, '05-search-result');

  // 7. 回到首页并做分区筛选
  await page.locator('.search-page__back').click();
  await page.waitForSelector('.channel-nav', { timeout: 6000 });
  const beforeFirstTitle = await page.locator('.video-card__title').first().innerText();
  await page.locator('.channel-nav__item', { hasText: '游戏' }).first().click();
  await page.waitForURL('**/?channel=game', { timeout: 6000 });
  await page.waitForTimeout(900);
  const gameTitle = await page.locator('.feed-toolbar__title').innerText();
  const partitions = await page.locator('.video-card__partition').allInnerTexts();
  const afterFirstTitle = await page.locator('.video-card__title').first().innerText();
  check('分区筛选生效', gameTitle.includes('游戏') && afterFirstTitle !== beforeFirstTitle,
    `${gameTitle.replace(/\s+/g, ' ')} | 分区标签: ${partitions.slice(0, 5).join(', ')}`);
  await shot(page, '06-channel-filter');

  // 排序切换
  await page.locator('.feed-toolbar__tab', { hasText: '最新发布' }).click();
  await page.waitForTimeout(800);
  check('排序切换生效', (await page.locator('.feed-toolbar__tab.is-active').innerText()).includes('最新'), await page.locator('.feed-toolbar__tab.is-active').innerText());

  // 换一换
  const beforeRefresh = await page.locator('.video-card__title').first().innerText();
  await page.locator('.channel-nav__item', { hasText: '推荐' }).first().click();
  await page.waitForTimeout(600);
  await page.locator('.feed-toolbar__refresh').click();
  await page.waitForTimeout(1200);
  const afterRefresh = await page.locator('.video-card__title').first().innerText();
  check('换一换刷新信息流', afterRefresh !== beforeRefresh, `${beforeRefresh.slice(0, 14)} -> ${afterRefresh.slice(0, 14)}`);

  // 8. 点进视频详情
  const targetTitle = await page.locator('.video-card__title').first().innerText();
  await page.locator('.video-card__cover').first().click();
  await page.waitForURL('**/video/**', { timeout: 8000 });
  await page.waitForSelector('.player__video', { timeout: 8000 });
  const detailTitle = await page.locator('.video-info__title').innerText();
  check('点击卡片跳转视频详情', detailTitle.trim() === targetTitle.trim(), detailTitle.slice(0, 36));

  // 9. 实际播放校验
  const playback = await page.evaluate(async () => {
    const v = document.querySelector('video');
    if (!v) return { error: 'no video element' };
    try { await v.play(); } catch (e) { /* 已自动播放 */ }
    const t0 = v.currentTime;
    await new Promise((r) => setTimeout(r, 2500));
    return {
      src: v.currentSrc,
      readyState: v.readyState,
      duration: v.duration,
      t0,
      t1: v.currentTime,
      paused: v.paused,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
    };
  });
  check('视频实际播放（currentTime 推进）',
    !playback.error && playback.t1 > playback.t0 + 0.5 && !playback.paused && playback.videoWidth > 0,
    `src=${(playback.src || '').split('/').pop()} ${playback.videoWidth}x${playback.videoHeight} duration=${Number(playback.duration).toFixed(1)}s ${playback.t0.toFixed(2)}s -> ${playback.t1.toFixed(2)}s paused=${playback.paused}`);

  const danmakuOnScreen = await page.locator('.danmaku-item').count();
  check('弹幕跟随播放上屏', danmakuOnScreen > 0, `${danmakuOnScreen} 条在屏`);
  await shot(page, '07-video-playing');

  // 播放器控制：暂停 / 进度 / 倍速
  await page.locator('.player__shell').hover();
  await page.locator('.player__bar .player__btn').first().click();
  await page.waitForTimeout(400);
  const paused = await page.evaluate(() => document.querySelector('video').paused);
  check('播放器暂停按钮可用', paused === true, `paused=${paused}`);
  await page.locator('.player__bar .player__btn').first().click();
  await page.waitForTimeout(400);
  const resumed = await page.evaluate(() => !document.querySelector('video').paused);
  check('播放器恢复播放', resumed, `playing=${resumed}`);

  // 一键三连（长按点赞）
  const likeBtn = page.locator('.action-bar__btn').first();
  const activeBefore = await page.locator('.action-bar__btn.is-active').count();
  await likeBtn.hover();
  await page.mouse.down();
  await page.waitForTimeout(800);
  await page.mouse.up();
  await page.waitForTimeout(700);
  const activeAfter = await page.locator('.action-bar__btn.is-active').count();
  const tripleToast = await page.locator('.action-bar__toast').innerText().catch(() => '');
  check('长按点赞触发一键三连（赞/币/藏同时点亮）', activeAfter >= 3 && tripleToast.includes('三连'),
    `点亮按钮 ${activeBefore} -> ${activeAfter}，提示: ${tripleToast}`);

  // 评论区
  const commentCount = await page.locator('.comment').count();
  check('评论区渲染', commentCount > 0, `${commentCount} 条评论`);
  // 相关推荐
  const relatedCount = await page.locator('.related__item').count();
  check('右侧相关推荐渲染', relatedCount > 0, `${relatedCount} 条推荐`);
  await shot(page, '08-video-detail-full');

  // 10. 返回首页
  await page.locator('.video-page__back').click();
  await page.waitForURL(`${BASE}/`, { timeout: 6000 });
  await page.waitForSelector('.video-card:not(.video-card--skeleton)', { timeout: 8000 });
  check('从详情页返回首页', page.url() === `${BASE}/`, page.url());

  // 浏览器后退同样可用
  await page.locator('.video-card__cover').first().click();
  await page.waitForURL('**/video/**', { timeout: 8000 });
  await page.goBack();
  await page.waitForSelector('.video-card:not(.video-card--skeleton)', { timeout: 8000 });
  check('浏览器后退回到首页', page.url().startsWith(`${BASE}/`) && !page.url().includes('/video/'), page.url());

  // 历史面板此时应有记录
  await page.locator('.header__entry', { hasText: '历史' }).hover();
  await page.waitForSelector('.mini-list__item', { timeout: 6000 });
  const historyCount = await page.locator('.mini-list__item').count();
  check('观看历史已落库并展示', historyCount > 0, `${historyCount} 条历史`);
  await shot(page, '09-home-back');

  check('浏览器无 JS 报错', errors.length === 0, errors.slice(0, 3).join(' | ') || '无');
  const realFailures = failedRequests.filter((f) => !f.includes('favicon'));
  check('无失败的网络请求', realFailures.length === 0, realFailures.slice(0, 3).join(' | ') || '无');
} catch (err) {
  check('自检脚本执行完成', false, String(err).slice(0, 300));
  await shot(page, 'error');
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n==== 自检结果: ${results.length - failed.length}/${results.length} 通过 ====`);
if (failed.length) {
  console.log(failed.map((f) => `  ✗ ${f.name}: ${f.detail}`).join('\n'));
  process.exit(1);
}

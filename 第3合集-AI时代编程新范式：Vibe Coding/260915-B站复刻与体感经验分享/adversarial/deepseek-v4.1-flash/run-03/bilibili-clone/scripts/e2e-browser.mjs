/**
 * 浏览器端 E2E 步骤脚本（由 scripts/e2e.mjs 拼上 WEB/API 前缀后交给 ego-browser 执行）。
 * 这里可以直接写普通 JS：helper（js/click/hover/...）由 ego-browser 预加载。
 */

const task = await useOrCreateTaskSpace('bilibili-clone-e2e');
const results = [];
const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: detail === undefined ? '' : String(detail) });

async function safeScroll(sel) {
  await js(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (e) e.scrollIntoView({block:'center'}); return !!e })()`);
  await wait(0.4);
}

// ---------- 1. 首页渲染 ----------
await gotoAndWait(`${WEB}/`, { timeout: 40, settle: 3 });
await wait(1);
const home = await js(`(() => ({
  cards: document.querySelectorAll('.card').length,
  channels: document.querySelectorAll('.channel').length,
  banners: document.querySelectorAll('.carousel__slide').length,
  promos: document.querySelectorAll('.promo__card').length,
  brokenImgs: [...document.querySelectorAll('img')].filter(i => i.naturalWidth === 0).length,
  imgTotal: document.querySelectorAll('img').length,
  activeTab: document.querySelector('.tabs__item.is-active')?.innerText,
  title: document.title,
}))()`);
check('首页渲染卡片 >= 12', home.cards >= 12, `cards=${home.cards}`);
check('首页分区导航 16 个', home.channels === 16, `channels=${home.channels}`);
check('轮播与推广位存在', home.banners >= 1 && home.promos === 4, `${home.banners}轮播/${home.promos}推广`);
check('图片零加载失败', home.brokenImgs === 0, `${home.imgTotal - home.brokenImgs}/${home.imgTotal}`);
check('首页默认分区为「全部」', home.activeTab === '全部', `active=${home.activeTab}`);

// ---------- 2. hover 卡片 ----------
await safeScroll('.card');
const rect = await js(`(() => { const b = document.querySelector('.card').getBoundingClientRect(); return { x: b.x + 120, y: b.y + 50 } })()`);
await hover([rect.x, rect.y], { label: 'hover 卡片' });
await wait(1);
const hovered = await js(`(() => {
  const c = document.querySelector('.card');
  const img = c.querySelector('.card__cover img');
  return {
    titleClass: c.querySelector('.card__title').className,
    later: c.querySelector('.card__later').className,
    mask: c.querySelector('.card__play-mask').className,
    scaled: getComputedStyle(img).transform !== 'none',
  };
})()`);
check('hover 标题变色', hovered.titleClass.includes('is-hover'), hovered.titleClass);
check('hover 出现「稍后再看」', hovered.later.includes('is-show'), hovered.later);
check('hover 出现播放遮罩', hovered.mask.includes('is-show'), hovered.mask);
check('hover 封面放大', hovered.scaled);

// ---------- 3. 菜单展开 ----------
await js('window.scrollTo(0, 0)');
await wait(0.4);
await hover('.channel:nth-child(3) .channel__btn', { label: 'hover 分区导航' });
await wait(0.7);
const panel = await js(`(() => { const p = document.querySelector('.channel:nth-child(3) .channel__panel'); return { visible: !!p && getComputedStyle(p).display !== 'none', tags: p ? p.querySelectorAll('.channel__tag').length : 0 } })()`);
check('分区二级菜单展开', panel.visible && panel.tags > 0, `tags=${panel.tags}`);

await hover('.user', { label: 'hover 头像菜单' });
await wait(0.7);
const menu = await js(`(() => { const m = document.querySelector('.user__menu'); return { visible: !!m && getComputedStyle(m).display !== 'none', cells: m ? m.querySelectorAll('.user__cell').length : 0 } })()`);
check('用户菜单展开', menu.visible && menu.cells === 4, `cells=${menu.cells}`);

await click('.publish__btn', { label: '展开投稿菜单' });
await wait(0.5);
const pub = await js(`(() => { const m = document.querySelector('.publish__menu'); return { visible: !!m && getComputedStyle(m).display !== 'none', items: m ? m.querySelectorAll('.publish__item').length : 0 } })()`);
check('投稿菜单展开', pub.visible && pub.items === 3, `items=${pub.items}`);

// ---------- 4. 顶栏面板（原先点了没反应的入口） ----------
await js('document.body.click()');
await wait(0.4);
await click('.action-wrap:nth-of-type(1) .action', { label: '打开消息面板' });
await wait(1.4);
const msg = await js(`(() => ({ items: document.querySelectorAll('.msg__item').length, text: (document.querySelector('.panel')?.innerText || '').slice(0, 36) }))()`);
check('消息面板有真实内容', msg.items > 0, msg.text.replace(/\n/g, ' | '));
await js('document.body.click()');
await wait(0.4);

// 动态面板（真实投稿列表）
await click('.action-wrap:nth-of-type(2) .action', { label: '打开动态面板' });
await wait(1.4);
const dyn = await js(`(() => ({ items: document.querySelectorAll('.action-wrap:nth-of-type(2) .videos__item').length }))()`);
check('动态面板有真实投稿', dyn.items > 0, `items=${dyn.items}`);
await js('document.body.click()');
await wait(0.4);

// 收藏面板（未收藏时给出引导文案，也算有效反馈）
await click('.action-wrap:nth-of-type(3) .action', { label: '打开收藏面板' });
await wait(1.4);
const favPanel = await js(`(() => { const p = document.querySelector('.action-wrap:nth-of-type(3) .panel'); const t = p ? p.innerText : ''; return { text: t.split(String.fromCharCode(10)).join(' ').slice(0, 40), items: p ? p.querySelectorAll('.videos__item').length : 0 } })()`);
check('收藏面板有反馈内容', favPanel.items > 0 || favPanel.text.length > 0, favPanel.text || `items=${favPanel.items}`);
await js('document.body.click()');
await wait(0.4);

// 创作中心面板（真实行为统计）
await click('.action-wrap:nth-of-type(4) .action', { label: '打开创作中心面板' });
await wait(1.4);
const creator = await js(`(() => ({ cells: document.querySelectorAll('.action-wrap:nth-of-type(4) .stats__cell').length }))()`);
check('创作中心面板有统计', creator.cells === 4, `cells=${creator.cells}`);
await js('document.body.click()');
await wait(0.4);

// 大会员：未接入的能力必须给出可见提示（不能是死按钮）
await click('.actions > .action:nth-of-type(1)', { label: '点击大会员' });
await wait(0.6);
const toast = await js(`(() => { const t = document.querySelector('.toast'); return t ? t.innerText.split(String.fromCharCode(10)).join(' ') : '' })()`);
check('未接入入口有明确提示', toast.includes('大会员'), toast || '(无提示)');
await wait(2.6);

// 页脚：不能残留 javascript:void(0) 之类的假链接
const footer = await js(`(() => ({
  fake: [...document.querySelectorAll('.footer a')].filter(a => a.getAttribute('href') === 'javascript:void(0)').length,
  portalLinks: document.querySelectorAll('.footer__link').length,
  textItems: document.querySelectorAll('.footer__text').length,
}))()`);
check('页脚没有假链接', footer.fake === 0, `fake=${footer.fake} portal=${footer.portalLinks} text=${footer.textItems}`);

// 页脚位于页面最底部，而首页触底会继续加载卡片把页脚顶下去，
// 因此这里滚到页脚后直接用元素 click() 触发 RouterLink（等价于用户点击链接）
await safeScroll('.footer__link');
await js(`(() => { document.querySelector('.footer__link').click(); return true })()`);
await wait(2.2);
const footerNav = await js(`(() => ({ url: location.pathname, head: document.querySelector('.category__head h1')?.innerText }))()`);
check('页脚入口真的会跳转', footerNav.url.startsWith('/category/'), JSON.stringify(footerNav));
await gotoAndWait(`${WEB}/`, { timeout: 40, settle: 2.5 });

// ---------- 5. 搜索建议 ----------
await click('.search-box__input input', { label: '聚焦搜索框' });
await wait(0.9);
const hot = await js(`(() => ({ rows: document.querySelectorAll('.hot-list li').length, title: document.querySelector('.search-panel__title')?.innerText }))()`);
check('聚焦弹出热搜榜', hot.rows === 10, `rows=${hot.rows}`);

await fillInput('.search-box__input input', '美食', { label: '输入关键词' });
await wait(1.4);
const sug = await js(`(() => ({ rows: document.querySelectorAll('.suggest-list li').length, first: document.querySelector('.suggest-list__text')?.innerText }))()`);
check('输入后出现搜索建议', sug.rows > 0, `rows=${sug.rows} first=${sug.first}`);
await pressKey('ArrowDown');
await wait(0.3);
const hl = await js(`(() => !!document.querySelector('.suggest-list li.is-active'))()`);
check('方向键可高亮建议', hl);

// ---------- 6. 分类筛选 + 排序 ----------
await gotoAndWait(`${WEB}/`, { timeout: 40, settle: 2.5 });
await safeScroll('.tabs-bar');
const beforeCat = await js(`(() => document.querySelector('.card__cat')?.innerText)()`);
await click('.tabs__item:nth-child(4)', { label: '切换到舞蹈分区' });
await wait(2.2);
const filtered = await js(`(() => ({
  active: document.querySelector('.tabs__item.is-active')?.innerText,
  cats: [...document.querySelectorAll('.card__cat')].slice(0, 3).map(e => e.innerText),
  total: document.querySelector('.tabs__count')?.innerText,
}))()`);
check('分类筛选生效', filtered.active === '舞蹈' && !filtered.cats.includes(beforeCat), `active=${filtered.active} cats=${filtered.cats.join('/')}`);

await click('.sorts__item:nth-child(2)', { label: '切换排序' });
await wait(2);
const sorted = await js(`(() => document.querySelector('.sorts__item.is-active')?.innerText)()`);
check('排序切换生效', sorted === '最多播放', `sort=${sorted}`);

// ---------- 7. 详情跳转 ----------
await gotoAndWait(`${WEB}/`, { timeout: 40, settle: 2.5 });
await safeScroll('.card');
const firstTitle = await js(`(() => document.querySelector('.card .card__title').innerText)()`);
await click('.card', { label: '点进视频详情' });
await wait(3);
const detail = await js(`(() => ({
  url: location.pathname,
  title: document.querySelector('.detail__title')?.innerText,
  src: document.querySelector('.player__video')?.getAttribute('src') || '',
  related: document.querySelectorAll('.side-card__list .card').length,
  comments: document.querySelectorAll('.list__item').length,
}))()`);
check('点击卡片进入详情且标题一致', detail.url.startsWith('/video/') && detail.title === firstTitle, `${detail.url} | ${detail.title}`);
check('详情页有播放源与关联推荐', !!detail.src && detail.related > 0, `${detail.src} related=${detail.related}`);

// ---------- 8. 实际播放 ----------
await safeScroll('.player__center');
await click('.player__center', { label: '点击播放' });
await wait(3.5);
const play = await js(`(() => {
  const v = document.querySelector('.player__video');
  return {
    paused: v.paused,
    t: Number(v.currentTime.toFixed(2)),
    dur: Number((v.duration || 0).toFixed(2)),
    danmaku: document.querySelectorAll('.danmaku-item').length,
    label: document.querySelector('.ctrl__time')?.innerText || '',
  };
})()`);
check('视频真的在播放', !play.paused && play.t > 0.5, `t=${play.t}/${play.dur} ${play.label}`);
check('弹幕在滚动', play.danmaku > 0, `onScreen=${play.danmaku}`);

// ---------- 9. 评论框快捷键隔离（P2-1 回归） ----------
await safeScroll('.editor__body textarea');
const pausedBefore = await js(`(() => document.querySelector('.player__video').paused)()`);
await js(`(() => {
  const ta = document.querySelector('.editor__body textarea');
  ta.focus();
  ta.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true }));
  ta.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, cancelable: true }));
  return true;
})()`);
await wait(1.2);
const pausedAfter = await js(`(() => document.querySelector('.player__video').paused)()`);
check('评论框内空格/方向键不劫持播放器', pausedBefore === pausedAfter, `paused ${pausedBefore} -> ${pausedAfter}`);

// ---------- 10. 弹幕携带进度（P2-2 回归） ----------
const mark = `E2E弹幕${Date.now().toString().slice(-6)}`;
const detailUrl = detail.url;
const bvid = detailUrl.split('/').pop();

// 暂停后把进度钉在 3.2s，再发弹幕 —— 这样时间点可以被精确断言
await js(`(() => {
  const v = document.querySelector('.player__video');
  if (!v.paused) v.pause();
  v.currentTime = 3.2;
  return true;
})()`);
await wait(0.8);
await fillInput('.danmaku-input input', mark, { label: '输入弹幕' });
await pressKey('Enter');
await wait(1.4);

// 后端核对：时间点必须等于发送时的进度
const dmApi = await serverFetch(`${API}/api/videos/${bvid}/danmaku`);
let dmTime = null;
try {
  const parsed = typeof dmApi === 'string' ? JSON.parse(dmApi) : dmApi;
  const hit = (parsed.data || []).find((d) => d.text === mark);
  dmTime = hit ? hit.time : null;
} catch (err) {
  dmTime = `parse-error: ${err.message}`;
}
check('弹幕时间点等于发送时的 3.2s', typeof dmTime === 'number' && Math.abs(dmTime - 3.2) < 0.05, `time=${dmTime}`);

// 重新加载详情页，把时间推进到该弹幕之后，确认它会重新出现
await gotoAndWait(`${WEB}${detailUrl}`, { timeout: 40, settle: 3 });
await wait(1);
// 先跳到弹幕时间点之前，再让进度「经过」它 —— 这正是用户重看该片段的路径
await js(`(() => { document.querySelector('.player__video').currentTime = 2.6; return true })()`);
await wait(0.7);
await js(`(() => { document.querySelector('.player__video').currentTime = 4.0; return true })()`);
await wait(1.2);
const persisted = await js(`(() => ({ hit: document.body.innerHTML.includes(${JSON.stringify(mark)}), onScreen: document.querySelectorAll('.danmaku-item').length }))()`);
check('刷新后弹幕在同一时点重新出现', persisted.hit, `mark=${mark} onScreen=${persisted.onScreen}`);

// ---------- 11. 返回首页 ----------
await js('window.scrollTo(0, 0)');
await wait(0.4);
await click('.detail__back', { label: '返回首页' });
await wait(2.5);
const back = await js(`(() => ({
  url: location.pathname,
  cards: document.querySelectorAll('.card').length,
  active: document.querySelector('.tabs__item.is-active')?.innerText,
}))()`);
check('返回首页且分区重置为全部', back.url === '/' && back.cards > 0 && back.active === '全部', JSON.stringify(back));

// ---------- 12. 分区页 URL / 标题 / 列表一致（P2-4 回归） ----------
await gotoAndWait(`${WEB}/category/game`, { timeout: 40, settle: 2.5 });
await safeScroll('.tabs-bar');
const cat1 = await js(`(() => ({ url: location.pathname, head: document.querySelector('.category__head h1')?.innerText, active: document.querySelector('.tabs__item.is-active')?.innerText }))()`);
await click('.tabs__item:nth-child(3)', { label: '分区页内切换分区' });
await wait(2.5);
const cat2 = await js(`(() => ({ url: location.pathname, head: document.querySelector('.category__head h1')?.innerText, active: document.querySelector('.tabs__item.is-active')?.innerText, title: document.title }))()`);
check('分区页初始状态一致', cat1.url === '/category/game' && cat1.head === '游戏' && cat1.active === '游戏', JSON.stringify(cat1));
check('分区页切换后 URL/标题/筛选一致', cat2.url.startsWith('/category/') && cat2.url !== cat1.url && cat2.head === cat2.active && cat2.title.includes(cat2.head), JSON.stringify(cat2));

// ---------- 13. 历史页 ----------
await gotoAndWait(`${WEB}/history`, { timeout: 40, settle: 2 });
const hist = await js(`(() => ({ cards: document.querySelectorAll('.card').length, bars: document.querySelectorAll('.card__progress').length }))()`);
check('历史页展示观看进度', hist.cards > 0 && hist.bars > 0, JSON.stringify(hist));

cliLog(`E2E_RESULT ${JSON.stringify(results)}`);
await completeTaskSpace(task.id, { keep: false });

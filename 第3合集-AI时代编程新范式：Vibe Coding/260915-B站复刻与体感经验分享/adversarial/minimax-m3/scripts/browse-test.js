/**
 * 端到端浏览链路走查：
 *   1) 打开首页 → 截图 1
 *   2) 等视频卡渲染 → 点第一张 → 跳到详情 → 截图 2
 *   3) 点"返回首页" → 截图 3
 *   4) 点搜索框 → 输入"罗翔" → 截图 4（看搜索建议）
 *   5) 滚到分类 tab → 切到"科技" → 截图 5
 * 输出到 console，失败抛错
 */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:5180';
const OUT = path.resolve(__dirname, '..');

async function shot(page, name) {
  const p = path.join(OUT, `test-${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log('  -> shot', p);
}

async function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text());
  });
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url() + ' ' + r.failure()?.errorText));

  console.log('[1] open home');
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('.video-card', { timeout: 10000 });
  await wait(800);
  await shot(page, '1-home');

  console.log('[2] click first video card');
  await page.click('.video-card');
  await page.waitForSelector('.player-video', { timeout: 10000 });
  await wait(1500);
  await shot(page, '2-detail');

  const url = page.url();
  if (!/\/video\//.test(url)) {
    errors.push('expected to be on /video/ page, got ' + url);
  } else {
    console.log('   navigated to', url);
  }

  console.log('[3] click "返回首页" link');
  await page.click('.back-link');
  await page.waitForFunction(() => location.hash === '#/' || location.hash === '' || location.hash === '#', { timeout: 8000 });
  await page.waitForSelector('.video-card', { timeout: 10000 });
  await wait(800);
  await shot(page, '3-back-home');

  const backUrl = page.url();
  if (!/127\.0\.0\.1:5180\/?(#\/?)?$/.test(backUrl) && !/127\.0\.0\.1:5180\/#\/$/.test(backUrl)) {
    errors.push('back url wrong: ' + backUrl);
  } else {
    console.log('   back at', backUrl);
  }

  console.log('[4] focus search and type 罗翔');
  await page.click('.search-input');
  await wait(300);
  await page.type('.search-input', '罗翔', { delay: 80 });
  await wait(600);
  await shot(page, '4-search-suggest');

  console.log('[5] clear search, switch category to 科技');
  await page.click('.search-input', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.click('body', { offset: { x: 10, y: 10 } }).catch(() => {});
  // 点击科技 tab
  const tabs = await page.$$('.tab-item');
  for (const t of tabs) {
    const txt = await page.evaluate((el) => el.textContent.trim(), t);
    if (txt.includes('科技')) { await t.click(); break; }
  }
  await wait(1500);
  await shot(page, '5-category-tech');

  await browser.close();

  console.log('\n=== SUMMARY ===');
  if (errors.length) {
    console.log('FAIL:');
    for (const e of errors) console.log('  -', e);
    process.exit(1);
  } else {
    console.log('OK: 5 steps, no errors');
    process.exit(0);
  }
})().catch((e) => {
  console.error('FATAL', e);
  process.exit(2);
});

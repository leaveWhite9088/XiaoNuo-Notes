// 接口冒烟自检：后端需先在 5801 端口运行（npm run dev）
// 用法：npm run check
const BASE = 'http://127.0.0.1:5801';
const FRONT = 'http://localhost:3801';

const results = [];
function report(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  -> ${detail}` : ''}`);
}

async function j(path) {
  const res = await fetch(BASE + path);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`code=${json.code} ${json.message}`);
  return json.data;
}

let failed = 0;

(async () => {
  // 1. 健康
  try {
    const d = await j('/api/health');
    report('GET /api/health', d.ok === true);
  } catch (e) {
    report('GET /api/health', false, e.message);
  }

  // 2. 分类
  let categories = [];
  try {
    categories = await j('/api/categories');
    report('GET /api/categories', categories.length >= 10, `共 ${categories.length} 个分区`);
  } catch (e) {
    report('GET /api/categories', false, e.message);
  }

  // 3. 首页 feed 分页
  let page1 = { list: [], has_more: false };
  try {
    page1 = await j('/api/feed?region=home&page=1&page_size=20');
    const ok = page1.list.length >= 10 && page1.total >= 40 && typeof page1.has_more === 'boolean';
    report('GET /api/feed 首页推荐流', ok, `${page1.list.length} 条 / 共 ${page1.total}`);
  } catch (e) {
    report('GET /api/feed 首页推荐流', false, e.message);
  }

  // 4. feed 第二页与第一页不重叠（分页有效）
  try {
    const p2 = await j('/api/feed?region=home&page=2&page_size=20');
    const ids1 = new Set(page1.list.map((v) => v.id));
    const overlap = p2.list.filter((v) => ids1.has(v.id)).length;
    report('GET /api/feed 第二页', p2.list.length > 0 && overlap === 0, `${p2.list.length} 条，重叠 ${overlap}`);
  } catch (e) {
    report('GET /api/feed 第二页', false, e.message);
  }

  // 5. 分区筛选：数据里出现的分区都能过滤出结果且 region 一致
  try {
    const regions = [...new Set((await j('/api/feed?region=home&page=1&page_size=50')).list.map((v) => v.region))];
    let allOk = true;
    let detail = [];
    for (const r of regions.slice(0, 6)) {
      const d = await j(`/api/feed?region=${r}&page=1&page_size=50`);
      const pure = d.list.every((v) => v.region === r);
      if (!pure || d.list.length === 0) allOk = false;
      detail.push(`${r}:${d.list.length}${pure ? '' : '(混杂)'}`);
    }
    report('GET /api/feed?region=xx 分区筛选', allOk, detail.join(' '));
  } catch (e) {
    report('GET /api/feed?region=xx 分区筛选', false, e.message);
  }

  // 6. 热门排序
  try {
    const d = await j('/api/feed?region=hot&page=1&page_size=20');
    const plays = d.list.map((v) => v.stat.play);
    const sorted = plays.every((p, i) => i === 0 || plays[i - 1] >= p);
    report('GET /api/feed?region=hot 热门排序', d.list.length > 0 && sorted, `top 播放 ${plays[0]}`);
  } catch (e) {
    report('GET /api/feed?region=hot 热门排序', false, e.message);
  }

  // 7. 详情
  let sample = null;
  try {
    sample = page1.list[0] || (await j('/api/feed?page=1&page_size=1')).list[0];
    const v = await j(`/api/video/${encodeURIComponent(sample.id)}`);
    const ok = v.id === sample.id && v.videoUrl && v.owner.name && Array.isArray(v.tags) && v.stat.play >= 0;
    report('GET /api/video/:id 详情', ok, sample.id);
  } catch (e) {
    report('GET /api/video/:id 详情', false, e.message);
  }

  // 8. 404 详情
  try {
    const res = await fetch(`${BASE}/api/video/BV1notexist000`);
    report('GET /api/video/不存在 -> 404', res.status === 404, `status=${res.status}`);
  } catch (e) {
    report('GET /api/video/不存在 -> 404', false, e.message);
  }

  // 9. 相关推荐
  try {
    const d = await j(`/api/video/${encodeURIComponent(sample.id)}/related?limit=12`);
    report('GET /api/video/:id/related', d.length >= 5 && !d.some((v) => v.id === sample.id), `${d.length} 条`);
  } catch (e) {
    report('GET /api/video/:id/related', false, e.message);
  }

  // 10. 搜索
  try {
    const kw = sample.title.slice(0, 2);
    const d = await j(`/api/search?q=${encodeURIComponent(kw)}&page=1&page_size=20`);
    report(`GET /api/search?q=${kw}`, d.total > 0 && d.list.length > 0, `${d.total} 条`);
  } catch (e) {
    report('GET /api/search', false, e.message);
  }

  // 11. 搜索建议
  try {
    const d = await j(`/api/search/suggest?q=${encodeURIComponent(sample.title.slice(0, 2))}`);
    report('GET /api/search/suggest', d.length > 0, `${d.length} 条联想`);
  } catch (e) {
    report('GET /api/search/suggest', false, e.message);
  }

  // 12. 热搜
  try {
    const d = await j('/api/search/hot');
    report('GET /api/search/hot', d.length >= 5, `${d.length} 条`);
  } catch (e) {
    report('GET /api/search/hot', false, e.message);
  }

  // 13. 评论读取 + 发表
  try {
    const before = await j(`/api/comments/${encodeURIComponent(sample.id)}`);
    const posted = await fetch(`${BASE}/api/comments/${encodeURIComponent(sample.id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: `[smoke 自检] ${new Date().toISOString()}` }),
    }).then((r) => r.json());
    const after = await j(`/api/comments/${encodeURIComponent(sample.id)}`);
    const ok = posted.code === 0 && after.total === before.total + 1 && after.list[0].isSelf;
    report('GET/POST /api/comments', ok, `评论 ${before.total} -> ${after.total}`);
  } catch (e) {
    report('GET/POST /api/comments', false, e.message);
  }

  // 14. 静态资源：封面 / 头像 / 视频可访问（走后端 5801）
  try {
    const cover = await fetch(BASE + sample.cover);
    const avatar = await fetch(BASE + sample.owner.face);
    const mp4 = await fetch(BASE + sample.videoUrl, { headers: { Range: 'bytes=0-1023' } });
    report(
      '静态资源(封面/头像/视频)',
      cover.status === 200 && avatar.status === 200 && (mp4.status === 200 || mp4.status === 206),
      `cover=${cover.status} avatar=${avatar.status} video=${mp4.status}`
    );
  } catch (e) {
    report('静态资源', false, e.message);
  }

  // 15. 前端 dev server 与代理
  try {
    const home = await fetch(FRONT + '/');
    const proxied = await fetch(FRONT + '/api/health');
    report('前端 3801 + /api 代理', home.status === 200 && proxied.status === 200, `home=${home.status} proxy=${proxied.status}`);
  } catch (e) {
    report('前端 3801 + /api 代理', false, e.message);
  }

  failed = results.filter((r) => !r.ok).length;
  console.log(`\n==== 冒烟结果: ${results.length - failed}/${results.length} 通过 ====`);
  process.exit(failed ? 1 : 0);
})();

import './AppFooter.css';

const COLUMNS = [
  { title: '关于我们', links: ['关于 bilibili', '加入我们', '友情链接', '联系我们'] },
  { title: '服务中心', links: ['帮助中心', '侵权申诉', '广告合作', '开放平台'] },
  { title: '合作伙伴', links: ['创作激励', 'MCN 合作', '内容合作', '游戏发行'] },
];

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        <div className="app-footer__brand">
          <strong>bilibili</strong>
          <p>本项目为个人学习用的 B 站首页复刻演示，视频内容与图片来自 B 站公开接口与开源片源。</p>
        </div>
        {COLUMNS.map((col) => (
          <div className="app-footer__col" key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <button>{l}</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="app-footer__bottom">
        <span>bilibili 首页复刻 Demo · 前端 3602 / 后端 5602</span>
      </div>
    </footer>
  );
}

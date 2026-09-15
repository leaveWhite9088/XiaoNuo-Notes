/** 站点页脚（静态信息，结构参考 B 站首页底部）。 */
import './footer.css';

const COLUMNS = [
  { title: '关于我们', items: ['关于我们', '加入我们', '联系我们', '广告合作'] },
  { title: '服务条款', items: ['用户协议', '隐私政策', '侵权投诉', '版权声明'] },
  { title: '帮助中心', items: ['帮助中心', '意见反馈', '侵权申诉', '安全中心'] },
  { title: '关注我们', items: ['公众号', '官方微博', '创作者学院', '开放平台'] },
];

export function AppFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__columns">
          {COLUMNS.map((col) => (
            <div key={col.title} className="footer__column">
              <h4>{col.title}</h4>
              {col.items.map((item) => (
                <a key={item} href="#footer">
                  {item}
                </a>
              ))}
            </div>
          ))}
          <div className="footer__brand">
            <p className="footer__slogan">( ゜- ゜)つロ 干杯~</p>
            <p className="footer__desc">
              本页面为个人学习用的 B 站首页复刻演示，数据、图片与视频均来自公开示例素材，
              与哔哩哔哩官方无关。
            </p>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2026 bilibili-clone demo</span>
          <span>前端 :3601 / 接口 :5601</span>
          <span>React + Vite + Express</span>
        </div>
      </div>
    </footer>
  );
}

import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SearchBar from '../search/SearchBar'
import {
  TvLogo, IconBell, IconDynamic, IconStar, IconHistory, IconCreate, IconUpload, IconVip
} from '../Icons'
import { loadStore } from '../../utils/format'

export default function Header({ overlay }) {
  const [solid, setSolid] = useState(!overlay)
  const location = useLocation()
  const later = loadStore('bili-later', [])
  const history = loadStore('bili-history', [])

  useEffect(() => {
    if (!overlay) {
      setSolid(true)
      return
    }
    const onScroll = () => setSolid(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay, location.pathname])

  return (
    <header className="bili-header">
      <div className={`bili-header__bar ${solid ? 'is-solid' : 'is-overlay'}`}>
        <div className="left-entry">
          <Link to="/" className="logo-link" style={{ color: solid ? '#fb7299' : '#fff' }}>
            <TvLogo />
            <span>bilibili</span>
          </Link>
          <Link className="entry-item" to="/">首页</Link>
          <div className="entry-item has-menu">
            番剧
            <div className="mini-menu">
              <Link to="/channel/anime">番剧</Link>
              <Link to="/channel/movie">电影</Link>
              <Link to="/channel/guochuang">国创</Link>
              <Link to="/channel/tv">电视剧</Link>
              <Link to="/channel/variety">综艺</Link>
              <Link to="/channel/documentary">纪录片</Link>
            </div>
          </div>
          <Link className="entry-item" to="/channel/ent">直播</Link>
          <div className="entry-item has-menu">
            游戏中心
            <div className="mini-menu">
              <Link to="/channel/game">游戏区首页</Link>
              <div className="row"><span>命运 2</span><span className="muted">正在热玩</span></div>
              <div className="row"><span>绝区零</span><span className="muted">新赛季</span></div>
              <div className="row"><span>鸣潮</span><span className="muted">活动中</span></div>
            </div>
          </div>
          <span className="entry-item">会员购</span>
          <span className="entry-item">漫画</span>
          <Link className="entry-item" to="/channel/game">赛事</Link>
          <div className="entry-item has-menu">
            下载客户端
            <div className="mini-menu">
              <div className="hint">扫码下载哔哩哔哩 App（演示）</div>
              <div className="row"><span>iPhone</span><span>Android</span></div>
            </div>
          </div>
        </div>

        <SearchBar />

        <div className="right-entry">
          <div className="right-item">
            <IconVip />
            <span>大会员</span>
            <div className="mini-menu">
              <div className="hint">开通大会员看高清、抢先看番剧</div>
              <div className="row"><span>年度大会员</span><span className="pink">限时优惠</span></div>
            </div>
          </div>
          <div className="right-item">
            <IconBell />
            <span>消息</span>
            <div className="mini-menu">
              <div className="row"><span>回复我的</span><span>3</span></div>
              <div className="row"><span>收到的赞</span><span>12</span></div>
              <div className="row"><span>@我的</span><span>1</span></div>
              <div className="row"><span>系统通知</span><span>2</span></div>
            </div>
          </div>
          <div className="right-item">
            <IconDynamic />
            <span>动态</span>
            <div className="mini-menu wide">
              <div className="hint">关注的 UP 最近更新</div>
              <div className="row"><span>喵星观察局</span><span className="muted">12分钟前</span></div>
              <div className="row"><span>极客小林</span><span className="muted">1小时前</span></div>
              <div className="row"><span>阿茶的厨房日记</span><span className="muted">昨天</span></div>
            </div>
          </div>
          <div className="right-item">
            <IconStar />
            <span>收藏</span>
            <div className="mini-menu">
              <div className="row"><span>默认收藏夹</span><span>{later.length}</span></div>
              <div className="row"><span>稍后再看</span><span>{later.length}</span></div>
              <div className="row"><span>周末补番</span><span>8</span></div>
            </div>
          </div>
          <div className="right-item">
            <IconHistory />
            <span>历史</span>
            <div className="mini-menu wide">
              {history.length === 0 && <div className="hint">还没有观看记录</div>}
              {history.slice(0, 6).map((item) => (
                <Link key={item.id} to={`/video/${item.id}`}>{item.title}</Link>
              ))}
            </div>
          </div>
          <div className="right-item">
            <IconCreate />
            <span>创作中心</span>
          </div>
          <Link className="right-item upload-btn" to="/">
            <IconUpload />
            投稿
          </Link>
          <div className="right-item">
            <img className="avatar" src="/avatars/u05.jpg" alt="当前用户" />
            <div className="mini-menu">
              <div className="hint">极客小林</div>
              <Link to="/">个人空间</Link>
              <div className="row"><span>我的钱包</span><span>32.0</span></div>
              <div className="row"><span>直播中心</span></div>
              <div className="row"><span>退出登录</span></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

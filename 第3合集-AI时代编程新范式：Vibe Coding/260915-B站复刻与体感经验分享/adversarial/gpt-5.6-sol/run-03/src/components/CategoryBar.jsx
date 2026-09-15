import { useRef, useState } from 'react'
import { BookOpen, CirclePlay, Flame, Radio, Sparkles } from 'lucide-react'

const quickLinks = [
  { label: '动态', icon: <Sparkles />, tone: 'pink', demo: true },
  { label: '热门', icon: <Flame />, tone: 'red', demo: false },
  { label: '频道', icon: <CirclePlay />, tone: 'mint', demo: true }
]

const secondary = [
  { label: '专栏', icon: <BookOpen /> },
  { label: '直播', icon: <Radio /> },
  { label: '活动', icon: <Sparkles /> }
]

export default function CategoryBar({ categories, active, onSelect }) {
  const [notice, setNotice] = useState('')
  const timer = useRef(null)

  const announce = (message) => {
    window.clearTimeout(timer.current)
    setNotice(message)
    timer.current = window.setTimeout(() => setNotice(''), 1800)
  }

  const handleQuickLink = (item) => {
    if (item.demo) announce(`${item.label}为演示入口`)
    else {
      onSelect('首页')
      announce('已返回热门推荐')
    }
  }

  return (
    <div className="channel-shell">
      <div className="quick-links">
        {quickLinks.map((item) => <button type="button" key={item.label} onClick={() => handleQuickLink(item)}><span className={`quick-icon ${item.tone}`}>{item.icon}</span><span>{item.label}</span></button>)}
      </div>
      <div className="category-grid" aria-label="视频分类">
        {categories.map((item) => <button type="button" key={item} aria-current={active === item ? 'page' : undefined} className={active === item ? 'active' : ''} onClick={() => onSelect(item)}>{item}</button>)}
      </div>
      <div className="secondary-links">
        {secondary.map((item) => <button type="button" key={item.label} onClick={() => announce(`${item.label}为演示入口`)}>{item.icon}{item.label}</button>)}
      </div>
      <div className="sr-only" aria-live="polite">{notice}</div>
      {notice ? <div className="channel-toast" role="status">{notice}</div> : null}
    </div>
  )
}

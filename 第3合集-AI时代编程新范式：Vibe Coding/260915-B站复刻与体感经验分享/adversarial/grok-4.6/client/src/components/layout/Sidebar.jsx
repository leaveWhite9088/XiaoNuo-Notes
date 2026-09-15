import { Link, useLocation, useParams } from 'react-router-dom'
import { IconHome, IconDynamic, IconHot } from '../Icons'

export default function Sidebar({ items = [] }) {
  const { id } = useParams()
  const loc = useLocation()
  const icon = (key) => {
    if (key === 'home') return <IconHome />
    if (key === 'dynamic') return <IconDynamic />
    if (key === 'hot') return <IconHot />
    return <span style={{ fontSize: 16 }}>●</span>
  }
  return (
    <aside className="left-rail">
      {items.map((item) => {
        const active =
          (item.id === 'home' && loc.pathname === '/') ||
          id === item.id ||
          (item.id === 'hot' && loc.pathname === '/channel/hot')
        return (
          <Link key={item.id} className={`rail-item ${active ? 'active' : ''}`} to={item.to}>
            {icon(item.icon)}
            {item.name}
          </Link>
        )
      })}
    </aside>
  )
}

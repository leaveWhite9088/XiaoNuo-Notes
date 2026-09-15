import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import { api } from '../api/client'
import { formatCount, formatDate, formatDuration } from '../utils/format'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [tab, setTab] = useState('video')
  const [sort, setSort] = useState('default')
  const [data, setData] = useState({ list: [], total: 0 })

  useEffect(() => {
    api.search(q, sort).then(setData).catch(() => setData({ list: [], total: 0 }))
  }, [q, sort])

  return (
    <div className="page-with-header">
      <Header />
      <div className="search-page">
        <div className="search-tabs">
          {['综合', '视频', '用户', '直播'].map((name) => {
            const key = name === '综合' ? 'all' : name === '视频' ? 'video' : name === '用户' ? 'user' : 'live'
            return (
              <button key={name} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
                {name}
              </button>
            )
          })}
        </div>
        <div className="search-sort">
          <span>共 {data.total} 条结果</span>
          <button className={sort === 'default' ? 'on' : ''} onClick={() => setSort('default')}>综合排序</button>
          <button className={sort === 'views' ? 'on' : ''} onClick={() => setSort('views')}>最多播放</button>
          <button className={sort === 'date' ? 'on' : ''} onClick={() => setSort('date')}>最新发布</button>
        </div>
        {(tab === 'live') && <div className="empty-feed">直播搜索为演示占位，请查看视频结果</div>}
        {(tab === 'user') && (
          <div>
            {[...new Map(data.list.map((v) => [v.up.id, v.up])).values()].map((u) => (
              <div key={u.id} className="search-result" style={{ gridTemplateColumns: '64px 1fr' }}>
                <img src={u.face} alt="" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                <div>
                  <strong>{u.name}</strong>
                  <div className="muted">{u.sign}</div>
                  <div className="muted">{formatCount(u.fans)} 粉丝</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {(tab === 'video' || tab === 'all') && data.list.map((v) => (
          <Link className="search-result" key={v.id} to={`/video/${v.id}`}>
            <img src={v.cover} alt="" />
            <div>
              <div className="card-title">{v.title}</div>
              <div className="muted">{v.up.name} · {formatDate(v.pubDate)}</div>
              <div className="muted">{formatCount(v.views)} 播放 · {formatDuration(v.duration)}</div>
            </div>
          </Link>
        ))}
        {!data.list.length && <div className="empty-feed">没有找到「{q}」相关视频</div>}
      </div>
    </div>
  )
}

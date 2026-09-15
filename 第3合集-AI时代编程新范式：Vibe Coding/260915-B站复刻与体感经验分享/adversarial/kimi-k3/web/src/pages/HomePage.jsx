import { useEffect, useState } from 'react'
import { api } from '../api.js'
import ChannelBar from '../components/ChannelBar.jsx'
import VideoCard from '../components/VideoCard.jsx'

export default function HomePage({ onOpenVideo, searchQuery, onSearch }) {
  const [categories, setCategories] = useState(['推荐'])
  const [activeCategory, setActiveCategory] = useState('推荐')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    api
      .videos({ category: activeCategory, q: searchQuery })
      .then((list) => {
        if (!cancelled) setVideos(list)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeCategory, searchQuery])

  return (
    <div className="home">
      <ChannelBar
        categories={categories}
        active={searchQuery ? '' : activeCategory}
        onSelect={(c) => {
          onSearch('')
          setActiveCategory(c)
        }}
      />

      {searchQuery && (
        <div className="search-result-bar">
          <span>
            「{searchQuery}」的搜索结果（{videos.length} 个）
          </span>
          <button onClick={() => onSearch('')}>清除搜索</button>
        </div>
      )}

      {loading && <div className="state-tip">加载中…</div>}
      {error && <div className="state-tip error">加载失败：{error}，请确认后端已启动</div>}
      {!loading && !error && videos.length === 0 && (
        <div className="state-tip">没有找到相关视频，换个关键词试试</div>
      )}

      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onOpen={onOpenVideo} />
        ))}
      </div>
    </div>
  )
}

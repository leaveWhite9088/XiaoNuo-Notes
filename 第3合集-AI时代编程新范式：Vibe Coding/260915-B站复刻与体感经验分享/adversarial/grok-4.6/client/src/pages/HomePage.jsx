import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Banner from '../components/layout/Banner'
import ChannelBar from '../components/layout/ChannelBar'
import Sidebar from '../components/layout/Sidebar'
import FloatActions from '../components/layout/FloatActions'
import VideoCard from '../components/video/VideoCard'
import Carousel from '../components/video/Carousel'
import { api } from '../api/client'

export default function HomePage() {
  const { id } = useParams()
  const channel = id || 'home'
  const [meta, setMeta] = useState(null)
  const [slides, setSlides] = useState([])
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [seed, setSeed] = useState(0)
  const [loading, setLoading] = useState(false)
  const isHome = channel === 'home'

  const load = useCallback(async (nextPage = 1, append = false) => {
    setLoading(true)
    try {
      const data = await api.videos({
        channel: isHome ? '' : channel,
        page: nextPage,
        pageSize: isHome ? 42 : 20,
        sort: channel === 'hot' ? 'views' : '',
        shuffle: isHome && nextPage === 1 && seed > 0 ? '1' : ''
      })
      setVideos((prev) => (append ? [...prev, ...data.list] : data.list))
      setHasMore(data.hasMore)
      setPage(nextPage)
    } finally {
      setLoading(false)
    }
  }, [channel, isHome, seed])

  useEffect(() => {
    api.channels().then(setMeta).catch(() => {})
    api.carousel().then(setSlides).catch(() => {})
  }, [])

  useEffect(() => {
    load(1, false).catch(() => setVideos([]))
  }, [load, seed])

  useEffect(() => {
    const onScroll = () => {
      if (!hasMore || loading) return
      if (window.innerHeight + window.scrollY > document.body.offsetHeight - 400) {
        load(page + 1, true).catch(() => {})
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasMore, page, load, loading])

  return (
    <div className={`page-home ${isHome ? '' : 'page-with-header'}`}>
      <div style={{ position: 'relative' }}>
        {isHome && <Banner />}
        <Header overlay={isHome} />
      </div>
      <ChannelBar meta={meta} />
      <div className="feed-layout">
        <Sidebar items={meta?.sidebar || []} />
        <div className="feed-grid">
          {isHome && <Carousel slides={slides} />}
          {videos.map((v) => (
            <VideoCard key={`${v.id}-${seed}`} video={v} />
          ))}
          {!videos.length && <div className="empty-feed">这个分区暂时没有内容，换个分类看看</div>}
          {hasMore && <div className="load-more">加载中...</div>}
        </div>
      </div>
      <FloatActions onRefresh={() => setSeed((n) => n + 1)} />
    </div>
  )
}

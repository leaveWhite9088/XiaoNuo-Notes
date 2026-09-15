import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import CategoryBar from '../components/CategoryBar.jsx'
import VideoCard from '../components/VideoCard.jsx'

const initialFeedState = { status: 'loading', videos: [], error: '' }

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categoryState, setCategoryState] = useState({ status: 'loading', categories: [], error: '' })
  const [feedState, setFeedState] = useState(initialFeedState)
  const [categoryRetry, setCategoryRetry] = useState(0)
  const [feedRetry, setFeedRetry] = useState(0)
  const [batch, setBatch] = useState(0)
  const feedRequestId = useRef(0)
  const categoryRequestId = useRef(0)
  const query = searchParams.get('q') || ''
  const active = searchParams.get('category') || '首页'

  useEffect(() => {
    const requestId = ++categoryRequestId.current
    const controller = new AbortController()
    setCategoryState((current) => ({ ...current, status: 'loading', error: '' }))

    async function loadCategories() {
      try {
        const response = await fetch('/api/categories', { signal: controller.signal })
        if (!response.ok) throw new Error(`分类加载失败（${response.status}）`)
        const data = await response.json()
        if (requestId !== categoryRequestId.current) return
        setCategoryState({ status: 'success', categories: data.categories, error: '' })
      } catch (error) {
        if (error.name === 'AbortError' || requestId !== categoryRequestId.current) return
        setCategoryState({ status: 'error', categories: [], error: error.message || '分类加载失败' })
      }
    }

    loadCategories()
    return () => controller.abort()
  }, [categoryRetry])

  useEffect(() => {
    const requestId = ++feedRequestId.current
    const controller = new AbortController()
    const params = new URLSearchParams()
    if (active !== '首页') params.set('category', active)
    if (query) params.set('q', query)
    setBatch(0)
    setFeedState((current) => ({ ...current, status: 'loading', error: '' }))

    async function loadVideos() {
      try {
        const response = await fetch(`/api/videos?${params}`, { signal: controller.signal })
        if (!response.ok) throw new Error(`视频加载失败（${response.status}）`)
        const data = await response.json()
        if (requestId !== feedRequestId.current) return
        setFeedState({ status: 'success', videos: data.videos, error: '' })
      } catch (error) {
        if (error.name === 'AbortError' || requestId !== feedRequestId.current) return
        setFeedState({ status: 'error', videos: [], error: error.message || '视频加载失败' })
      }
    }

    loadVideos()
    return () => controller.abort()
  }, [active, query, feedRetry])

  const displayedVideos = useMemo(() => {
    const { videos } = feedState
    if (videos.length < 2) return videos
    const offset = batch % videos.length
    return [...videos.slice(offset), ...videos.slice(0, offset)]
  }, [batch, feedState])

  const selectCategory = (category) => {
    setSearchParams(category === '首页' ? {} : { category })
  }

  const refresh = () => setBatch((current) => current + 1)

  return (
    <div className="page-home">
      <Header />
      <main>
        {categoryState.status === 'error' ? (
          <div className="channel-error" role="alert">
            <span>{categoryState.error}</span>
            <button type="button" onClick={() => setCategoryRetry((current) => current + 1)}>重试分类</button>
          </div>
        ) : (
          <CategoryBar categories={categoryState.categories} active={active} onSelect={selectCategory} />
        )}
        <section className="feed-section" aria-busy={feedState.status === 'loading'}>
          <div className="feed-heading">
            <h1>{query ? <>“{query}” 的全站搜索结果</> : active !== '首页' ? active : <><Sparkles size={24} /> 推荐</>}</h1>
            <button
              type="button"
              onClick={refresh}
              className="refresh-button"
              disabled={feedState.status !== 'success' || feedState.videos.length < 2}
              title={feedState.videos.length < 2 ? '当前结果不足两条，无法换一换' : '切换推荐顺序'}
            >
              <RefreshCw className={batch ? 'spin' : ''} size={17} /> 换一换
            </button>
          </div>
          {feedState.status === 'loading' ? (
            <div className="video-grid" aria-label="正在加载视频">{Array.from({ length: 8 }).map((_, index) => <div className="skeleton-card" key={index}><span /><i /><i /></div>)}</div>
          ) : feedState.status === 'error' ? (
            <div className="error-state" role="alert">
              <AlertCircle size={42} />
              <h2>视频没有加载成功</h2>
              <p>{feedState.error}</p>
              <button type="button" onClick={() => setFeedRetry((current) => current + 1)}>重新加载</button>
            </div>
          ) : displayedVideos.length ? (
            <div className="video-grid">{displayedVideos.map((video) => <VideoCard key={video.id} video={video} />)}</div>
          ) : (
            <div className="empty-state"><span>⌕</span><h2>没有找到相关视频</h2><p>换个关键词或分类试试看吧</p><button type="button" onClick={() => setSearchParams({})}>返回推荐</button></div>
          )}
          <div className="sr-only" aria-live="polite">{batch ? `已切换到第 ${batch + 1} 批推荐顺序` : ''}</div>
        </section>
      </main>
      <footer><b>bilibili</b><span>关于我们 · 联系我们 · 用户协议 · 隐私政策</span><small>这是用于界面复刻练习的非官方演示项目</small></footer>
    </div>
  )
}

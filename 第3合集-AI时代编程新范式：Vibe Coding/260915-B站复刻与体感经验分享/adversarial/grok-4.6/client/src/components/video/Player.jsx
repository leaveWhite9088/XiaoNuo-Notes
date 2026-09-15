import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '../../utils/format'

export default function Player({ video, comments = [] }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showDanmaku, setShowDanmaku] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [flying, setFlying] = useState([])
  const [mediaError, setMediaError] = useState(false)
  const [duration, setDuration] = useState(video.duration || 0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    setMediaError(false)
    setProgress(0)
    const t = setTimeout(() => {
      ref.current?.play().catch(() => {})
    }, 80)
    return () => clearTimeout(t)
  }, [video?.id])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onTime = () => {
      setCurrent(el.currentTime || 0)
      setProgress(el.duration ? el.currentTime / el.duration : 0)
    }
    const onMeta = () => setDuration(el.duration || video.duration || 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [video?.id])

  useEffect(() => {
    if (!showDanmaku || !comments.length) {
      setFlying([])
      return
    }
    const items = comments.slice(0, 10).map((c, idx) => ({
      id: c.id,
      text: c.text,
      top: 12 + (idx % 8) * 28,
      delay: idx * 0.7
    }))
    setFlying(items)
  }, [comments, showDanmaku, video?.id])

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    if (ref.current?.duration) ref.current.currentTime = ratio * ref.current.duration
  }

  return (
    <div className="player-wrap">
      <video
        ref={ref}
        src={video.videoUrl}
        poster={video.cover}
        controls={false}
        autoPlay
        muted
        playsInline
        onError={() => setMediaError(true)}
        onClick={() => (playing ? ref.current.pause() : ref.current.play())}
      />
      {mediaError && (
        <div className="player-fallback">演示视频源暂时无法加载，仍可浏览封面、简介和评论。点击重试。
          <button
            onClick={() => {
              setMediaError(false)
              ref.current?.load()
              ref.current?.play()
            }}
          >
            重试播放
          </button>
        </div>
      )}
      {showDanmaku && (
        <div className="danmaku-layer">
          {flying.map((d) => (
            <span
              key={d.id}
              className="danmaku-item"
              style={{ top: d.top, right: -20, animationDelay: `${d.delay}s` }}
            >
              {d.text}
            </span>
          ))}
        </div>
      )}
      <div className="player-bar">
        <button onClick={() => (playing ? ref.current.pause() : ref.current.play())}>
          {playing ? '暂停' : '播放'}
        </button>
        <div className="progress" onClick={seek}>
          <i style={{ width: `${progress * 100}%` }} />
        </div>
        <span>
          {formatDuration(current)} / {formatDuration(duration)}
        </span>
        <button onClick={() => setShowDanmaku((v) => !v)}>{showDanmaku ? '弹幕开' : '弹幕关'}</button>
        <button
          onClick={() => {
            const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1
            setSpeed(next)
            if (ref.current) ref.current.playbackRate = next
          }}
        >
          {speed}x
        </button>
        <button
          onClick={() => {
            const el = ref.current?.parentElement
            if (!el) return
            if (document.fullscreenElement) document.exitFullscreen()
            else el.requestFullscreen()
          }}
        >
          全屏
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Carousel({ slides = [] }) {
  const [i, setI] = useState(0)
  const navigate = useNavigate()
  const current = slides[i] || slides[0]

  useEffect(() => {
    if (!slides.length) return
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 4200)
    return () => clearInterval(t)
  }, [slides.length])

  if (!current) return null

  return (
    <div className="carousel" onClick={() => navigate(`/video/${current.videoId}`)}>
      <img src={current.image} alt={current.title} />
      <button
        className="carousel-nav prev"
        onClick={(e) => {
          e.stopPropagation()
          setI((n) => (n - 1 + slides.length) % slides.length)
        }}
      >
        ‹
      </button>
      <button
        className="carousel-nav next"
        onClick={(e) => {
          e.stopPropagation()
          setI((n) => (n + 1) % slides.length)
        }}
      >
        ›
      </button>
      <div className="carousel-tools">
        <strong>{current.title}</strong>
        <div className="dots">
          {slides.map((s, idx) => (
            <i key={s.id} className={idx === i ? 'on' : ''} />
          ))}
        </div>
      </div>
    </div>
  )
}

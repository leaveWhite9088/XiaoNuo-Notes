import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { IconSearch } from '../Icons'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [data, setData] = useState({ hot: [], videos: [], users: [] })
  const boxRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => {
      api.suggest(q).then(setData).catch(() => {})
    }, 180)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onClick = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const goSearch = (text) => {
    const keyword = (text ?? q).trim()
    if (!keyword) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(keyword)}`)
  }

  return (
    <div className="center-search" ref={boxRef}>
      <form
        className={`search-form ${open ? 'is-open' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          goSearch()
        }}
      >
        <input
          value={q}
          placeholder="S16 四强复盘"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
        />
        <button type="submit" aria-label="搜索">
          <IconSearch />
        </button>
      </form>
      {open && (
        <div className="suggest">
          <h4>{q ? '搜索建议' : 'bilibili热搜'}</h4>
          <ul>
            {(q ? data.videos : data.hot).map((item, i) => (
              <li
                key={`${item.type}-${item.text}-${i}`}
                onMouseDown={() => {
                  if (item.type === 'video' && item.id) navigate(`/video/${item.id}`)
                  else goSearch(item.text)
                }}
              >
                <span>
                  {!q && <b className="rank">{i + 1}</b>} {item.text}
                </span>
                {item.extra && <span className="muted">{item.extra}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

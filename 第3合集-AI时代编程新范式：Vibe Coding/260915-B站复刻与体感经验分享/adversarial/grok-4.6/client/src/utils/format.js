export function formatCount(n) {
  const num = Number(n) || 0
  if (num >= 100000000) {
    const v = num / 100000000
    return (v >= 10 ? v.toFixed(0) : v.toFixed(1)).replace(/\.0$/, '') + '亿'
  }
  if (num >= 10000) {
    const v = num / 10000
    return (v >= 100 ? v.toFixed(0) : v.toFixed(1)).replace(/\.0$/, '') + '万'
  }
  return String(num)
}

export function formatDuration(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const pad = (x) => String(x).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    const m = String(iso).match(/(\d{2})-(\d{2})/)
    return m ? `${m[1]}-${m[2]}` : iso
  }
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function loadStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

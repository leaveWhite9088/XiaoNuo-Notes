export function formatCount(n) {
  const num = Number(n) || 0
  if (num >= 100000000) return (num / 100000000).toFixed(1).replace(/\.0$/, '') + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  return String(num)
}

export function formatDuration(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return `${m}:${String(r).padStart(2, '0')}`
}

export function formatDate(input) {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const now = Date.now()
  const diff = now - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 8) return `${days}天前`
  const y = d.getFullYear()
  const md = `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`
  return y === new Date().getFullYear() ? md : `${y}-${md}`
}

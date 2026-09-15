import { IconRefresh, IconTop } from '../Icons'

export default function FloatActions({ onRefresh }) {
  return (
    <div className="float-actions">
      <button className="float-btn" onClick={onRefresh}>
        <IconRefresh />
        刷新
      </button>
      <button className="float-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <IconTop />
        顶部
      </button>
    </div>
  )
}

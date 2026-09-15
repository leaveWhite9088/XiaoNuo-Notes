import { useEffect, useState } from 'react'
import { formatCount } from '../../utils/format'

export default function CommentSection({ comments }) {
  const [list, setList] = useState(comments)
  const [text, setText] = useState('')

  useEffect(() => {
    setList(comments)
  }, [comments])

  const submit = () => {
    if (!text.trim()) return
    setList([
      {
        id: `local-${Date.now()}`,
        user: { name: '极客小林', face: '/avatars/u05.jpg' },
        text: text.trim(),
        likes: 0,
        time: '刚刚',
        replies: []
      },
      ...list
    ])
    setText('')
  }

  return (
    <section className="comment-box">
      <h3>评论 {list.length}</h3>
      <div className="comment-editor">
        <img src="/avatars/u05.jpg" alt="" />
        <textarea value={text} placeholder="发一条友善的评论" onChange={(e) => setText(e.target.value)} />
        <button onClick={submit}>发布</button>
      </div>
      {list.map((c) => (
        <div key={c.id} className="comment-item">
          <img src={c.user.face} alt="" />
          <div>
            <div>
              <span className="who">{c.user.name}</span>
              <span className="when">{c.time}</span>
            </div>
            <p>{c.text}</p>
            <div className="muted">点赞 {formatCount(c.likes)}</div>
            {c.replies?.map((r) => (
              <div key={r.id} className="replies">
                {r.user.name}：{r.text}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

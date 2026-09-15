import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Header from '../src/components/Header.jsx'
import HomePage from '../src/pages/HomePage.jsx'
import VideoPage from '../src/pages/VideoPage.jsx'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function NavigationHarness() {
  const navigate = useNavigate()
  return (
    <>
      <button type="button" onClick={() => navigate('/video/B')}>去 B</button>
      <button type="button" onClick={() => navigate('/video/C')}>去 C</button>
      <Routes><Route path="/video/:id" element={<VideoPage />} /></Routes>
    </>
  )
}

const detailPayload = (id) => ({
  video: {
    id,
    title: `视频 ${id}`,
    author: `作者 ${id}`,
    category: '知识',
    cover: '/images/cover-01.jpg',
    mediaUrl: '/media/flower.mp4',
    mediaLabel: '统一 5 秒演示视频',
    duration: '00:05',
    durationSeconds: 5.055,
    views: '1万',
    danmaku: '100',
    date: '今天',
    likes: '10',
    coins: '2',
    favorites: '3',
    description: `描述 ${id}`
  },
  related: []
})

const cardVideo = (id, title, category = '知识') => ({
  ...detailPayload(id).video,
  id,
  title,
  category
})

describe('全局导航与请求竞态', () => {
  it('从生活分类搜索宇宙时清除分类参数并进入全站搜索', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ suggestions: [] }) })))
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/?category=生活']}>
        <Header />
        <LocationProbe />
      </MemoryRouter>
    )

    await user.type(screen.getByRole('textbox', { name: '搜索视频' }), '宇宙')
    await user.click(screen.getByRole('button', { name: '全站搜索' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/?q=%E5%AE%87%E5%AE%99')
    expect(screen.getByTestId('location')).not.toHaveTextContent('category')
  })

  it('首页忽略分类旧响应，并在失败后允许重试', async () => {
    let allFeedCalls = 0
    vi.stubGlobal('fetch', vi.fn((url) => {
      const value = String(url)
      if (value === '/api/categories') return Promise.resolve({ ok: true, json: async () => ({ categories: ['首页', '生活', '知识'] }) })
      if (value.includes('category=')) {
        return new Promise((resolve) => window.setTimeout(() => resolve({ ok: true, json: async () => ({ videos: [cardVideo('L', '生活旧结果', '生活')] }) }), 100))
      }
      if (value.includes('q=')) {
        return new Promise((resolve) => window.setTimeout(() => resolve({ ok: true, json: async () => ({ videos: [cardVideo('U', '宇宙最新结果')] }) }), 10))
      }
      allFeedCalls += 1
      if (allFeedCalls === 1) return Promise.resolve({ ok: false, status: 503, json: async () => ({}) })
      return Promise.resolve({ ok: true, json: async () => ({ videos: [cardVideo('R', '重试成功')] }) })
    }))
    const user = userEvent.setup()
    const view = render(<MemoryRouter initialEntries={['/?category=生活']}><HomePage /><LocationProbe /></MemoryRouter>)

    await user.type(screen.getByRole('textbox', { name: '搜索视频' }), '宇宙')
    await user.click(screen.getByRole('button', { name: '全站搜索' }))
    expect(await screen.findByRole('link', { name: '宇宙最新结果' })).toBeInTheDocument()
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 120)) })
    expect(screen.queryByRole('link', { name: '生活旧结果' })).not.toBeInTheDocument()
    expect(screen.getByTestId('location')).not.toHaveTextContent('category')

    view.unmount()
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: '视频没有加载成功' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '重新加载' }))
    expect(await screen.findByRole('link', { name: '重试成功' })).toBeInTheDocument()
  })

  it('搜索建议失败时显示错误并可重试', async () => {
    let calls = 0
    vi.stubGlobal('fetch', vi.fn(async () => {
      calls += 1
      if (calls === 1) return { ok: false, status: 503, json: async () => ({}) }
      return { ok: true, json: async () => ({ suggestions: ['宇宙漫游'] }) }
    }))
    const user = userEvent.setup()
    render(<MemoryRouter><Header /></MemoryRouter>)

    await user.click(screen.getByRole('textbox', { name: '搜索视频' }))
    expect(await screen.findByText('搜索建议加载失败（503）')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '重试' }))
    expect(await screen.findByRole('option', { name: /宇宙漫游/ })).toBeInTheDocument()
  })

  it('只有两条结果时换一换也可靠改变首条内容', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (String(url) === '/api/categories') return { ok: true, json: async () => ({ categories: ['首页', '知识'] }) }
      return { ok: true, json: async () => ({ videos: [cardVideo('1', '第一条'), cardVideo('2', '第二条')] }) }
    }))
    const user = userEvent.setup()
    render(<MemoryRouter initialEntries={['/?category=知识']}><HomePage /></MemoryRouter>)

    expect(await screen.findByRole('link', { name: '第一条' })).toBeInTheDocument()
    const titlesBefore = screen.getAllByRole('heading').filter((heading) => heading.closest('.video-card')).map((heading) => heading.textContent)
    await user.click(screen.getByRole('button', { name: '换一换' }))
    const titlesAfter = screen.getAllByRole('heading').filter((heading) => heading.closest('.video-card')).map((heading) => heading.textContent)
    expect(titlesBefore[0]).toBe('第一条')
    expect(titlesAfter[0]).toBe('第二条')
  })

  it('A→B→C 请求乱序完成后只展示 C，且交互状态按 id 重置', async () => {
    const delays = { A: 100, B: 70, C: 10 }
    vi.stubGlobal('fetch', vi.fn((url) => {
      const id = String(url).split('/').at(-1)
      return new Promise((resolve) => window.setTimeout(() => resolve({ ok: true, json: async () => detailPayload(id) }), delays[id]))
    }))
    const user = userEvent.setup()

    render(<MemoryRouter initialEntries={['/video/A']}><NavigationHarness /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: '去 B' }))
    await user.click(screen.getByRole('button', { name: '去 C' }))

    expect(await screen.findByRole('heading', { name: '视频 C' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /10/ }))
    expect(screen.getByRole('button', { name: '已点赞' })).toHaveAttribute('aria-pressed', 'true')

    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 130)) })
    expect(screen.getByRole('heading', { name: '视频 C' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '视频 A' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '视频 B' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '去 B' }))
    expect(await screen.findByRole('heading', { name: '视频 B' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /10/ })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('checkbox', { name: '显示弹幕' })).toBeChecked()
    expect(screen.getByRole('button', { name: /关注 42.6万/ })).toHaveAttribute('aria-pressed', 'false')
  })
})

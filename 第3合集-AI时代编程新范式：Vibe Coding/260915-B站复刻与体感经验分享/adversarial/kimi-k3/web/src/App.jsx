import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './pages/HomePage.jsx'
import VideoPage from './pages/VideoPage.jsx'

function readRoute() {
  const m = window.location.pathname.match(/^\/video\/(\d+)/)
  return m ? { name: 'video', id: Number(m[1]) } : { name: 'home' }
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const onPop = () => setRoute(readRoute())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goHome = useCallback(() => {
    window.history.pushState({}, '', '/')
    setRoute({ name: 'home' })
    window.scrollTo(0, 0)
  }, [])

  const goVideo = useCallback((id) => {
    window.history.pushState({}, '', `/video/${id}`)
    setRoute({ name: 'video', id })
    window.scrollTo(0, 0)
  }, [])

  const handleSearch = useCallback(
    (q) => {
      setSearchQuery(q)
      if (route.name !== 'home') goHome()
    },
    [route.name, goHome]
  )

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Header
        onLogoClick={goHome}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onSearch={handleSearch}
      />
      <Sidebar open={sidebarOpen} onNavigate={goHome} />
      <main className="main">
        {route.name === 'home' ? (
          <HomePage onOpenVideo={goVideo} searchQuery={searchQuery} onSearch={handleSearch} />
        ) : (
          <VideoPage id={route.id} onBack={goHome} onOpenVideo={goVideo} />
        )}
      </main>
    </div>
  )
}

import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Layout() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-700 no-underline">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
            <span>黎明高校汇总网</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors no-underline">首页</Link>
            <button
              onClick={() => navigate('/admin')}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-none cursor-pointer"
            >
              后台管理
            </button>
          </nav>
          <button
            className="md:hidden p-2 text-gray-600 border-none bg-transparent cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3">
            <Link to="/" className="text-gray-700 hover:text-blue-600 no-underline" onClick={() => setMobileOpen(false)}>首页</Link>
            <button
              onClick={() => { navigate('/admin'); setMobileOpen(false); }}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-none cursor-pointer w-fit"
            >
              后台管理
            </button>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t mt-16 py-8 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-1">黎明高校汇总网 © {new Date().getFullYear()} — 客观真实的高校信息平台</p>
          <p>数据仅供参考，请以学校官方信息为准</p>
        </div>
      </footer>
    </div>
  )
}

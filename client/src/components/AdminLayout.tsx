import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { clearAdminAuth } from './AdminGuard'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: '概览', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/templates', label: '标签模板', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { path: '/admin/comments', label: '评价管理', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    clearAdminAuth()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xl font-bold text-blue-700 no-underline">黎明高校汇总网 · 后台管理</Link>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors no-underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              前台预览
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-3 sticky top-24">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left border-none cursor-pointer transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

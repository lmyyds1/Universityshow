import { useState, useEffect } from 'react'

const ADMIN_KEY = 'university_show_admin_authenticated'

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_KEY) === 'true'
}

export function setAdminAuthenticated() {
  sessionStorage.setItem(ADMIN_KEY, 'true')
}

export function clearAdminAuth() {
  sessionStorage.removeItem(ADMIN_KEY)
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') {
      setAdminAuthenticated()
      setAuthenticated(true)
      setError('')
    } else {
      setError('密码错误，请重试')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (authenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">管理员登录</h1>
          <p className="text-sm text-gray-500 mt-1">请输入管理员密码以继续</p>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入管理员密码"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm mb-4"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-none cursor-pointer font-medium"
          >
            登录
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">默认密码: admin123</p>
      </div>
    </div>
  )
}

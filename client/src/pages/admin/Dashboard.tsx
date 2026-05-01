import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { UniversityListItem } from '../../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [universities, setUniversities] = useState<UniversityListItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    setLoading(true)
    api.getUniversities()
      .then(setUniversities)
      .catch(() => alert('加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定删除「${name}」吗？该操作不可撤销。`)) return
    try {
      await api.deleteUniversity(id)
      setUniversities(prev => prev.filter(u => u.id !== id))
    } catch {
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">大学管理</h1>
        <Link
          to="/admin/university/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加大学
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-5 py-3 font-medium">学校</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">类型</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">位置</th>
              <th className="px-5 py-3 font-medium">平均分</th>
              <th className="px-5 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {universities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">暂无数据，点击右上角添加第一所大学</td>
              </tr>
            ) : (
              universities.map(uni => (
                <tr key={uni.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-800">{uni.name}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{uni.type}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{uni.location}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-blue-600">{uni.avgScore}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/university/${uni.id}/ratings`)}
                        className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors border-none cursor-pointer"
                      >
                        评分
                      </button>
                      <button
                        onClick={() => navigate(`/admin/university/${uni.id}/tags`)}
                        className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors border-none cursor-pointer"
                      >
                        标签
                      </button>
                      <button
                        onClick={() => navigate(`/admin/university/${uni.id}/edit`)}
                        className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors border-none cursor-pointer"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(uni.id, uni.name)}
                        className="px-2.5 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors border-none cursor-pointer"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

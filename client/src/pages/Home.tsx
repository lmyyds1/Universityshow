import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { UniversityListItem } from '../types'

const TYPE_FILTERS = ['全部', '985/211/双一流', '211/双一流', '普通本科', '高职专科']

export default function Home() {
  const [universities, setUniversities] = useState<UniversityListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [inputValue, setInputValue] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const typeParam = typeFilter === '全部' ? undefined : typeFilter
      const data = await api.getUniversities(search || undefined, typeParam)
      setUniversities(data)
    } catch {
      setUniversities([])
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    const timer = setTimeout(fetchData, 300)
    return () => clearTimeout(timer)
  }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(inputValue)
  }

  const getTypeBadgeColor = (type: string) => {
    if (type.includes('985')) return 'bg-red-100 text-red-700 border-red-200'
    if (type.includes('211')) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">黎明高校汇总网</h1>
          <p className="text-blue-100 text-lg mb-8">客观真实的高校信息平台，查看全国高校的真实评价，了解宿舍、食堂、师资、环境等全方位信息</p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="搜索学校名称、城市或关键词..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-800 bg-white border-none outline-none focus:ring-2 focus:ring-blue-300 text-base"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition-colors border-none cursor-pointer"
            >
              搜索
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {TYPE_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg">未找到匹配的学校</p>
            <p className="text-sm mt-1">试试其他搜索关键词</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map(uni => (
              <Link
                key={uni.id}
                to={`/school/${uni.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6 no-underline text-inherit block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {uni.name}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ml-2 ${getTypeBadgeColor(uni.type)}`}>
                    {uni.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {uni.location}
                </p>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                  {uni.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-blue-600">{uni.avgScore}</span>
                    <span className="text-xs text-gray-400">/10</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {uni.student_count > 0 ? `${(uni.student_count / 10000).toFixed(1)}万在校生` : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

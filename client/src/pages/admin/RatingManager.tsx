import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { Rating } from '../../types'

const CATEGORIES = ['宿舍条件', '食堂质量', '师资水平', '校园环境', '人文氛围', '就业支持', '安全指数']

export default function RatingManager() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)
  const [uniName, setUniName] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!id) return
    api.getUniversity(parseInt(id)).then(uni => setUniName(uni.name)).catch(() => {})
    fetchRatings()
  }, [id])

  const fetchRatings = () => {
    if (!id) return
    setLoading(true)
    api.getRatings(parseInt(id))
      .then(setRatings)
      .catch(() => alert('加载失败'))
      .finally(() => setLoading(false))
  }

  const handleScoreChange = async (category: string, score: number) => {
    try {
      const rating = await api.upsertRating(parseInt(id!), category, score)
      setRatings(prev => {
        const existing = prev.find(r => r.category === category)
        if (existing) return prev.map(r => r.id === existing.id ? rating : r)
        return [...prev, rating]
      })
    } catch { alert('更新失败') }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500'
    if (score >= 6) return 'bg-yellow-500'
    return 'bg-red-500'
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-blue-600 border-none cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">评分管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">{uniName}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-sm text-gray-400 mb-4">点击数字可直接修改评分，点击空白区域可输入新评分</p>
        <div className="space-y-4 max-w-lg">
          {CATEGORIES.map(cat => {
            const rating = ratings.find(r => r.category === cat)
            const score = rating?.score || 0
            return (
              <div key={cat} className="flex items-center gap-4">
                <span className="w-20 text-sm font-medium text-gray-700">{cat}</span>
                <div className="flex-1 flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => {
                    const isActive = score >= s
                    return (
                      <button
                        key={s}
                        onClick={() => handleScoreChange(cat, s)}
                        className={`w-7 h-7 rounded text-xs font-medium border-none cursor-pointer transition-colors ${
                          isActive ? `${getScoreColor(s)} text-white` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={`${s}分`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
                <span className="w-10 text-right">
                  {score > 0 ? (
                    <span className={`text-lg font-bold ${score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {score}
                    </span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import type { UniversityDetail, Comment } from '../types'
import RatingBar from '../components/RatingBar'
import TagBadge from '../components/TagBadge'

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>()
  const [uni, setUni] = useState<UniversityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [commentName, setCommentName] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getUniversity(parseInt(id))
      .then(data => {
        setUni(data)
        setComments(data.comments || [])
        setError('')
      })
      .catch(() => setError('大学信息加载失败'))
      .finally(() => setLoading(false))
  }, [id])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim() || !id) return
    setSubmitting(true)
    try {
      const newComment = await api.createComment(parseInt(id), commentName || '匿名用户', commentContent)
      setComments(prev => [newComment, ...prev])
      setCommentName('')
      setCommentContent('')
    } catch {
      alert('评论提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !uni) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-40 text-center">
        <p className="text-xl text-gray-400 mb-4">{error || '大学不存在'}</p>
        <Link to="/" className="text-blue-600 hover:underline no-underline">返回首页</Link>
      </div>
    )
  }

  const avgScore = uni.ratings.length > 0
    ? Math.round((uni.ratings.reduce((s, r) => s + r.score, 0) / uni.ratings.length) * 10) / 10
    : 0

  return (
    <div>
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/" className="text-blue-600 hover:underline no-underline">首页</Link>
            <span>/</span>
            <span className="text-gray-600">{uni.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{uni.name}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {uni.location}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {uni.established_year && <span>创办于 {uni.established_year} 年</span>}
              {uni.student_count > 0 && <span>{(uni.student_count / 10000).toFixed(1)} 万在校生</span>}
            </div>
          </div>

          {uni.feature_tag && (
            <div className="mt-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {uni.feature_tag}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">学校简介</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{uni.description}</p>

              {uni.website && (
                <a
                  href={uni.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-blue-600 hover:underline no-underline text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  访问官网
                </a>
              )}
            </section>

            {uni.tags && uni.tags.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">特色标签</h2>
                <p className="text-xs text-gray-400 mb-3">将鼠标悬停在标签上可查看补充说明</p>
                <div className="flex flex-wrap gap-3">
                  {uni.tags.map(tag => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                用户评论
                <span className="text-sm font-normal text-gray-400 ml-2">({comments.length})</span>
              </h2>

              <form onSubmit={handleComment} className="mb-6 p-4 bg-gray-50 rounded-xl">
                <input
                  type="text"
                  placeholder="你的昵称（选填）"
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  className="w-full px-4 py-2.5 mb-3 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400"
                  maxLength={20}
                />
                <textarea
                  placeholder="写下你对这所学校的评价..."
                  value={commentContent}
                  onChange={e => setCommentContent(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400 resize-none"
                  rows={3}
                  required
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !commentContent.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-none cursor-pointer text-sm"
                  >
                    {submitting ? '提交中...' : '发布评论'}
                  </button>
                </div>
              </form>

              {comments.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无评论，来写第一条吧！</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800 text-sm">{c.user_name}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-4xl font-bold text-blue-600">{avgScore}</span>
                <div>
                  <span className="text-gray-500 text-sm block">综合评分</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-3 h-3 rounded-sm ${i <= Math.round(avgScore / 2) ? 'bg-yellow-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {uni.ratings.map(r => (
                  <RatingBar key={r.id} category={r.category} score={r.score} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

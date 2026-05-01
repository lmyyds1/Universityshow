import { useState, useEffect } from 'react'
import { api } from '../../api'
import type { Comment, AuditLog } from '../../types'

export default function CommentManager() {
  const [comments, setComments] = useState<Comment[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState(0)
  const [showLogs, setShowLogs] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ user_name: '', content: '', rating: 0 })
  const [newForm, setNewForm] = useState({ user_name: '', content: '', rating: 5, university_id: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      api.getAllComments(search || undefined),
      api.getAuditLogs(),
    ]).then(([c, l]) => {
      setComments(c)
      setAuditLogs(l)
    }).catch(() => alert('加载失败'))
      .finally(() => setLoading(false))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.content.trim() || !newForm.university_id) {
      alert('请填写评论内容和关联大学ID')
      return
    }
    setAdding(true)
    try {
      await api.createComment(
        parseInt(newForm.university_id),
        newForm.user_name || '管理员',
        newForm.content,
        newForm.rating
      )
      setNewForm({ user_name: '', content: '', rating: 5, university_id: '' })
      fetchData()
    } catch { alert('添加失败') }
    finally { setAdding(false) }
  }

  const startEdit = (c: Comment) => {
    setEditingId(c.id)
    setEditForm({ user_name: c.user_name, content: c.content, rating: c.rating || 0 })
  }

  const handleEdit = async (id: number) => {
    try {
      await api.updateComment(id, editForm)
      setEditingId(null)
      fetchData()
    } catch { alert('保存失败') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该评论吗？')) return
    try {
      await api.deleteComment(id)
      fetchData()
    } catch { alert('删除失败') }
  }

  const filteredComments = filterRating > 0
    ? comments.filter(c => c.rating === filterRating)
    : comments

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
        <h1 className="text-2xl font-bold text-gray-800">评价管理</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">共 {comments.length} 条评价</span>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer ${
              showLogs ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            操作日志
          </button>
        </div>
      </div>

      {showLogs && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 max-h-64 overflow-auto">
          <h3 className="text-sm font-bold text-gray-700 mb-3">操作日志</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-1.5 font-medium">时间</th>
                <th className="pb-1.5 font-medium">操作</th>
                <th className="pb-1.5 font-medium">详情</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('zh-CN')}
                  </td>
                  <td className="py-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      log.action === 'CREATE' ? 'bg-green-50 text-green-600' :
                      log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                      'bg-red-50 text-red-500'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-1.5 text-gray-600">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">搜索</label>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索用户名或内容..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">评分筛选</label>
          <select
            value={filterRating}
            onChange={e => setFilterRating(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
          >
            <option value={0}>全部</option>
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(s => (
              <option key={s} value={s}>{s} 分</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border-none cursor-pointer text-sm"
        >
          查询
        </button>
      </form>

      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">新增评价</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">大学ID</label>
            <input
              type="number"
              value={newForm.university_id}
              onChange={e => setNewForm(p => ({ ...p, university_id: e.target.value }))}
              placeholder="如 1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">用户名</label>
            <input
              value={newForm.user_name}
              onChange={e => setNewForm(p => ({ ...p, user_name: e.target.value }))}
              placeholder="管理员或匿名"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">评分 (1-10)</label>
            <select
              value={newForm.rating}
              onChange={e => setNewForm(p => ({ ...p, rating: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white"
            >
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(s => (
                <option key={s} value={s}>{s} 分</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 border-none cursor-pointer text-sm"
          >
            {adding ? '添加中...' : '添加评价'}
          </button>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-500 mb-1">评价内容 *</label>
          <textarea
            value={newForm.content}
            onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))}
            rows={2}
            placeholder="请输入评价内容..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm resize-none"
          />
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">用户</th>
              <th className="px-5 py-3 font-medium">内容</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">评分</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">日期</th>
              <th className="px-5 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredComments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">暂无评价数据</td>
              </tr>
            ) : (
              filteredComments.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  {editingId === c.id ? (
                    <>
                      <td className="px-5 py-3 text-gray-400 text-xs">{c.id}</td>
                      <td className="px-5 py-3">
                        <input
                          value={editForm.user_name}
                          onChange={e => setEditForm(p => ({ ...p, user_name: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400 text-sm"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <textarea
                          value={editForm.content}
                          onChange={e => setEditForm(p => ({ ...p, content: e.target.value }))}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400 text-sm resize-none"
                        />
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <select
                          value={editForm.rating}
                          onChange={e => setEditForm(p => ({ ...p, rating: parseInt(e.target.value) }))}
                          className="px-2 py-1 border border-gray-200 rounded outline-none text-sm bg-white"
                        >
                          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-gray-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleEdit(c.id)}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs border-none cursor-pointer mr-1"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 text-xs border-none cursor-pointer"
                        >
                          取消
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-gray-400 text-xs">{c.id}</td>
                      <td className="px-5 py-3 font-medium text-gray-700">{c.user_name}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-80 truncate">{c.content}</td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          (c.rating || 0) >= 8 ? 'bg-green-50 text-green-600' :
                          (c.rating || 0) >= 5 ? 'bg-yellow-50 text-yellow-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {c.rating ? `${c.rating}分` : '未评'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell text-xs">
                        {new Date(c.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => startEdit(c)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs border-none cursor-pointer mr-1"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="px-3 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100 text-xs border-none cursor-pointer"
                        >
                          删除
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

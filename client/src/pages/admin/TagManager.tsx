import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { FeatureTag } from '../../types'

export default function TagManager() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tags, setTags] = useState<FeatureTag[]>([])
  const [loading, setLoading] = useState(true)
  const [uniName, setUniName] = useState('')

  const [newTag, setNewTag] = useState({ tag_name: '', status: 1, description: '', sort_order: 0 })
  const [adding, setAdding] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ tag_name: '', status: 1, description: '', sort_order: 0 })

  useEffect(() => {
    if (!id) return
    api.getUniversity(parseInt(id)).then(uni => setUniName(uni.name)).catch(() => {})
    fetchTags()
  }, [id])

  const fetchTags = () => {
    if (!id) return
    setLoading(true)
    api.getTags(parseInt(id))
      .then(setTags)
      .catch(() => alert('加载失败'))
      .finally(() => setLoading(false))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.tag_name.trim()) { alert('请输入标签名称'); return }
    setAdding(true)
    try {
      await api.createTag(parseInt(id!), newTag)
      setNewTag({ tag_name: '', status: 1, description: '', sort_order: 0 })
      fetchTags()
    } catch { alert('添加失败') }
    finally { setAdding(false) }
  }

  const startEdit = (tag: FeatureTag) => {
    setEditingId(tag.id)
    setEditForm({ tag_name: tag.tag_name, status: tag.status, description: tag.description, sort_order: tag.sort_order })
  }

  const handleEdit = async (tagId: number) => {
    try {
      await api.updateTag(tagId, editForm)
      setEditingId(null)
      fetchTags()
    } catch { alert('保存失败') }
  }

  const handleDelete = async (tagId: number) => {
    if (!confirm('确定删除该标签？')) return
    try {
      await api.deleteTag(tagId)
      fetchTags()
    } catch { alert('删除失败') }
  }

  const toggleStatus = async (tag: FeatureTag) => {
    try {
      await api.updateTag(tag.id, { status: tag.status === 1 ? 0 : 1 })
      fetchTags()
    } catch { alert('更新失败') }
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
        <button onClick={() => navigate('/admin')}
          className="p-2 bg-white rounded-lg shadow-sm text-gray-500 hover:text-blue-600 border-none cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">标签管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">{uniName}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm p-5 mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">标签名</label>
          <input value={newTag.tag_name} onChange={e => setNewTag(p => ({ ...p, tag_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" placeholder="如：上床下铺" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">补充说明</label>
          <input value={newTag.description} onChange={e => setNewTag(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" placeholder="如：学生宿舍是否提供上床下铺" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">状态</label>
          <select value={newTag.status} onChange={e => setNewTag(p => ({ ...p, status: parseInt(e.target.value) }))}
            className="px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm bg-white">
            <option value={1}>✓ 是</option>
            <option value={0}>✗ 否</option>
          </select>
        </div>
        <button type="submit" disabled={adding}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 border-none cursor-pointer text-sm">
          {adding ? '添加中...' : '添加标签'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-5 py-3 font-medium">标签</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">状态</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">补充说明</th>
              <th className="px-5 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tags.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-gray-400">暂无标签，在上方添加</td>
              </tr>
            ) : (
              tags.map(tag => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  {editingId === tag.id ? (
                    <>
                      <td className="px-5 py-3">
                        <input value={editForm.tag_name} onChange={e => setEditForm(p => ({ ...p, tag_name: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400 text-sm" />
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: parseInt(e.target.value) }))}
                          className="px-2 py-1 border border-gray-200 rounded outline-none text-sm bg-white">
                          <option value={1}>✓ 是</option>
                          <option value={0}>✗ 否</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                          className="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400 text-sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleEdit(tag.id)}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs border-none cursor-pointer mr-1">保存</button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 text-xs border-none cursor-pointer">取消</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 font-medium text-gray-800">{tag.tag_name}</td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <button
                          onClick={() => toggleStatus(tag)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border-none cursor-pointer ${
                            tag.status === 1 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {tag.status === 1 ? '✓' : '✗'}
                          {tag.status === 1 ? '是' : '否'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden md:table-cell truncate max-w-60">{tag.description}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => startEdit(tag)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs border-none cursor-pointer mr-1">编辑</button>
                        <button onClick={() => handleDelete(tag.id)}
                          className="px-3 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100 text-xs border-none cursor-pointer">删除</button>
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

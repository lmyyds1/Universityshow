import { useState, useEffect } from 'react'
import { api } from '../../api'
import type { TagTemplate, TagTemplateItem } from '../../types'

const COLOR_CLASSES = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-teal-100 text-teal-700']

const EMPTY_ITEM: TagTemplateItem = { tag_name: '', status: 1, description: '' }

export default function TemplateManager() {
  const [templates, setTemplates] = useState<TagTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formItems, setFormItems] = useState<TagTemplateItem[]>([{ ...EMPTY_ITEM }])

  useEffect(() => { fetchData() }, [])

  const fetchData = () => {
    setLoading(true)
    api.getTagTemplates()
      .then(setTemplates)
      .catch(() => alert('加载失败'))
      .finally(() => setLoading(false))
  }

  const resetForm = () => {
    setFormName('')
    setFormDesc('')
    setFormItems([{ ...EMPTY_ITEM }])
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (tpl: TagTemplate) => {
    setEditingId(tpl.id)
    setFormName(tpl.name)
    setFormDesc(tpl.description || '')
    setFormItems(tpl.tags.length > 0 ? tpl.tags.map(t => ({ ...t })) : [{ ...EMPTY_ITEM }])
    setShowForm(true)
  }

  const handleItemChange = (idx: number, field: keyof TagTemplateItem, value: string | number) => {
    setFormItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleAddItem = () => {
    setFormItems(prev => [...prev, { ...EMPTY_ITEM, sort_order: prev.length } as TagTemplateItem & { sort_order: number }])
  }

  const handleRemoveItem = (idx: number) => {
    if (formItems.length <= 1) return
    setFormItems(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validItems = formItems.filter(i => i.tag_name.trim())
    if (!formName.trim()) { alert('请输入模板名称'); return }
    if (validItems.length === 0) { alert('至少需要一个标签'); return }

    setSaving(true)
    try {
      const data = { name: formName, description: formDesc, tags: validItems }
      if (editingId) {
        await api.updateTagTemplate(editingId, data)
      } else {
        await api.createTagTemplate(data)
      }
      resetForm()
      fetchData()
    } catch { alert('保存失败') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该模板？')) return
    try {
      await api.deleteTagTemplate(id)
      fetchData()
    } catch { alert('删除失败') }
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">标签模板管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">预设标签组合，新建大学时一键应用</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors border-none cursor-pointer text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建模板
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? '编辑模板' : '新建模板'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">模板名称 *</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="如：理想宿舍型、都市便利型"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">模板描述</label>
                <input
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="描述该模板的适用场景"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">标签列表 *</label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-blue-600 hover:text-blue-700 border-none bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加标签
                </button>
              </div>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                {formItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-6">{idx + 1}.</span>
                    <input
                      value={item.tag_name}
                      onChange={e => handleItemChange(idx, 'tag_name', e.target.value)}
                      placeholder="标签名（如上床下铺）"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm bg-white"
                    />
                    <select
                      value={item.status}
                      onChange={e => handleItemChange(idx, 'status', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white w-24"
                    >
                      <option value={1}>✓ 是</option>
                      <option value={0}>✗ 否</option>
                    </select>
                    <input
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="补充说明"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm bg-white hidden sm:block"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={resetForm}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border-none cursor-pointer text-sm">
                取消
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors border-none cursor-pointer text-sm">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-lg">暂无标签模板</p>
          <p className="text-sm mt-1">点击"新建模板"创建第一个预设标签组合</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(tpl => (
            <div key={tpl.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{tpl.name}</h3>
                  {tpl.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{tpl.tags.length} 个标签</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tpl.tags.slice(0, 6).map((tag, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${COLOR_CLASSES[i % COLOR_CLASSES.length]}`}>
                    <span className="font-bold">{tag.status === 1 ? '✓' : '✗'}</span>
                    {tag.tag_name}
                  </span>
                ))}
                {tpl.tags.length > 6 && (
                  <span className="text-xs text-gray-400">+{tpl.tags.length - 6}</span>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => startEdit(tpl)}
                  className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs border-none cursor-pointer font-medium transition-colors"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="flex-1 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs border-none cursor-pointer font-medium transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

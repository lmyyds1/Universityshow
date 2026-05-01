import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { University, TagTemplate, TagTemplateItem } from '../../types'

const EMPTY_TAG: TagTemplateItem = { tag_name: '', status: 1, description: '' }

export default function UniversityForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', type: '普通本科', location: '', description: '',
    website: '', established_year: '', student_count: '', feature_tag: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [templates, setTemplates] = useState<TagTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [manualTags, setManualTags] = useState<TagTemplateItem[]>([{ ...EMPTY_TAG }])
  const [useManual, setUseManual] = useState(false)

  useEffect(() => {
    api.getTagTemplates().then(setTemplates).catch(() => {})
    if (isEdit) {
      setLoading(true)
      api.getUniversity(parseInt(id!))
        .then(uni => {
          setForm({
            name: uni.name, type: uni.type, location: uni.location,
            description: uni.description, website: uni.website,
            established_year: uni.established_year?.toString() || '',
            student_count: uni.student_count?.toString() || '',
            feature_tag: uni.feature_tag || '',
          })
        })
        .catch(() => alert('加载失败'))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleTagChange = (idx: number, field: keyof TagTemplateItem, value: string | number) => {
    setManualTags(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const addTagRow = () => setManualTags(prev => [...prev, { ...EMPTY_TAG }])
  const removeTagRow = (idx: number) => {
    if (manualTags.length <= 1) return
    setManualTags(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { alert('请输入大学名称'); return }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        ...form,
        established_year: form.established_year ? parseInt(form.established_year) : null,
        student_count: form.student_count ? parseInt(form.student_count) : 0,
      }
      if (useManual) {
        const validTags = manualTags.filter(t => t.tag_name.trim())
        ;(data as Record<string, unknown>).tags = validTags
      } else if (selectedTemplateId) {
        ;(data as Record<string, unknown>).template_id = selectedTemplateId
      }
      if (isEdit) {
        await api.updateUniversity(parseInt(id!), data as Partial<University>)
      } else {
        await api.createUniversity(data as Partial<University>)
      }
      navigate('/admin')
    } catch {
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleApplyTemplateToExisting = async () => {
    if (!selectedTemplateId || !isEdit) return
    if (!confirm('确定将选中模板的标签替换当前大学的所有标签？')) return
    try {
      await api.applyTemplate(selectedTemplateId, parseInt(id!))
      alert('标签模板已应用')
    } catch { alert('应用失败') }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

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
        <h1 className="text-2xl font-bold text-gray-800">{isEdit ? '编辑大学' : '添加大学'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">学校名称 *</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">学校类型</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm bg-white">
                <option>985/211/双一流</option>
                <option>211/双一流</option>
                <option>普通本科</option>
                <option>高职专科</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">所在城市</label>
              <input name="location" value={form.location} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">官网地址</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="https://"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">创办年份</label>
              <input name="established_year" type="number" value={form.established_year} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">在校学生数</label>
              <input name="student_count" type="number" value={form.student_count} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">特色标签（如 985/211）</label>
              <input name="feature_tag" value={form.feature_tag} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm" />
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">学校简介</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            特色标签设置
            {!useManual && selectedTemplateId && (
              <span className="text-xs font-normal text-green-600 ml-2">已选择模板: {selectedTemplate?.name} ({selectedTemplate?.tags.length} 个标签)</span>
            )}
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tagMode"
                checked={!useManual}
                onChange={() => setUseManual(false)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">从模板选择</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tagMode"
                checked={useManual}
                onChange={() => setUseManual(true)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">手动添加标签</span>
            </label>
            {templates.length === 0 && !useManual && (
              <button
                type="button"
                onClick={() => setUseManual(true)}
                className="text-xs text-blue-600 hover:underline border-none bg-transparent cursor-pointer"
              >
                暂无模板，点此手动添加
              </button>
            )}
          </div>

          {!useManual ? (
            <div>
              {templates.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400">
                  <p className="mb-2">暂无可用的标签模板</p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/templates')}
                    className="text-sm text-blue-600 hover:underline border-none bg-transparent cursor-pointer"
                  >
                    前往模板管理页面创建模板
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map(tpl => (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplateId === tpl.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-800">{tpl.name}</span>
                        {selectedTemplateId === tpl.id && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {tpl.description && <p className="text-xs text-gray-400 mb-2">{tpl.description}</p>}
                      <div className="flex flex-wrap gap-1">
                        {tpl.tags.slice(0, 5).map((tag, i) => (
                          <span key={i} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${
                            tag.status === 1 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          }`}>
                            {tag.status === 1 ? '✓' : '✗'}{tag.tag_name}
                          </span>
                        ))}
                        {tpl.tags.length > 5 && (
                          <span className="text-xs text-gray-400">+{tpl.tags.length - 5}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEdit && selectedTemplateId && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleApplyTemplateToExisting}
                    className="text-sm px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border-none cursor-pointer transition-colors"
                  >
                    立即应用模板（将替换当前标签）
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">手动录入标签 ({manualTags.length})</span>
                <button
                  type="button"
                  onClick={addTagRow}
                  className="text-xs text-blue-600 hover:text-blue-700 border-none bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加标签
                </button>
              </div>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                {manualTags.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5">{idx + 1}.</span>
                    <input
                      value={item.tag_name}
                      onChange={e => handleTagChange(idx, 'tag_name', e.target.value)}
                      placeholder="标签名（如上床下铺）"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm bg-white"
                    />
                    <select
                      value={item.status}
                      onChange={e => handleTagChange(idx, 'status', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-200 rounded-lg outline-none text-sm bg-white w-24 shrink-0"
                    >
                      <option value={1}>✓ 是</option>
                      <option value={0}>✗ 否</option>
                    </select>
                    <input
                      value={item.description}
                      onChange={e => handleTagChange(idx, 'description', e.target.value)}
                      placeholder="补充说明"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm bg-white hidden lg:block"
                    />
                    <button
                      type="button"
                      onClick={() => removeTagRow(idx)}
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
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin')}
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
  )
}

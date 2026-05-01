import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import type { University } from '../../types'

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

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.getUniversity(parseInt(id!))
        .then(uni => setForm({
          name: uni.name, type: uni.type, location: uni.location,
          description: uni.description, website: uni.website,
          established_year: uni.established_year?.toString() || '',
          student_count: uni.student_count?.toString() || '',
          feature_tag: uni.feature_tag || '',
        }))
        .catch(() => alert('加载失败'))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { alert('请输入大学名称'); return }
    setSaving(true)
    try {
      const data: Partial<University> = {
        ...form,
        established_year: form.established_year ? parseInt(form.established_year) : null,
        student_count: form.student_count ? parseInt(form.student_count) : 0,
      }
      if (isEdit) {
        await api.updateUniversity(parseInt(id!), data)
      } else {
        await api.createUniversity(data)
      }
      navigate('/admin')
    } catch {
      alert('保存失败')
    } finally {
      setSaving(false)
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
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
          <textarea name="description" value={form.description} onChange={handleChange} rows={6}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-sm resize-none" />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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

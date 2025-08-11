'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Guide {
  id: string
  name: string
  gender: string
  contactPhone: string
  contactEmail: string
  languages: string[]
  specialties: string[]
  experience: number
  notes?: string
  isActive: boolean
  occupiedDates: string[]
  createdAt: string
  updatedAt: string
}

export default function GuideEditPage() {
  const params = useParams()
  const router = useRouter()
  const guideId = params.id as string
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    contactPhone: '',
    contactEmail: '',
    languages: [] as string[],
    specialties: [] as string[],
    experience: 0,
    notes: '',
    isActive: true
  })

  const [newLanguage, setNewLanguage] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')

  useEffect(() => {
    fetchGuideData()
  }, [guideId])

  const fetchGuideData = async () => {
    try {
      const response = await fetch(`/api/guides/${guideId}`)
      if (!response.ok) {
        throw new Error('获取导游信息失败')
      }

      const guideData = await response.json()
      setGuide(guideData)

      // 设置表单数据
      setFormData({
        name: guideData.name || '',
        gender: guideData.gender || 'male',
        contactPhone: guideData.contactPhone || '',
        contactEmail: guideData.contactEmail || '',
        languages: guideData.languages || [],
        specialties: guideData.specialties || [],
        experience: guideData.experience || 0,
        notes: guideData.notes || '',
        isActive: guideData.isActive !== false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? Number(value) : value
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage('')
    }
  }

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/guides/${guideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新失败')
      }

      setSuccess('导游信息更新成功！')
      setTimeout(() => {
        router.push('/guides')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error && !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                编辑导游
              </h1>
              <p className="text-gray-600">
                {guide?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/guides/${guideId}`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                取消
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      姓名 *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      性别 *
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      required
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      联系电话 *
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      id="contactPhone"
                      required
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      邮箱 *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      id="contactEmail"
                      required
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                      经验 (年) *
                    </label>
                    <input
                      type="number"
                      name="experience"
                      id="experience"
                      required
                      min="0"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                      状态 *
                    </label>
                    <select
                      name="isActive"
                      id="isActive"
                      required
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      备注
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 语言技能 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">语言技能</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="添加语言技能"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm"
                    >
                      添加
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 专业特长 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">专业特长</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="添加专业特长"
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                    />
                    <button
                      type="button"
                      onClick={addSpecialty}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 text-sm"
                    >
                      添加
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/guides/${guideId}`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存更改'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 
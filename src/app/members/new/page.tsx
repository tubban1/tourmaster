'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Tour {
  id: string
  name: string
  maxCapacity: number
  currentMembersCount: number
}

export default function NewMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tours, setTours] = useState<Tour[]>([])

  const [formData, setFormData] = useState({
    tourId: '',
    firstName: '',
    lastName: '',
    gender: 'male',
    dateOfBirth: '',
    passportNumber: '',
    contactEmail: '',
    contactPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    healthNotes: '',
    dietaryRestrictions: ''
  })

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours')
      if (response.ok) {
        const data = await response.json()
        setTours(data)
      }
    } catch (err) {
      console.error('获取旅行团列表失败:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建失败')
      }

      setSuccess('团员添加成功！')
      setTimeout(() => {
        router.push('/members')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                添加团员
              </h1>
              <p className="text-gray-600">
                为旅行团添加新团员
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/members"
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
                    <label htmlFor="tourId" className="block text-sm font-medium text-gray-700">
                      选择旅行团 *
                    </label>
                    <select
                      name="tourId"
                      id="tourId"
                      required
                      value={formData.tourId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">请选择旅行团</option>
                      {tours.map((tour) => (
                        <option key={tour.id} value={tour.id}>
                          {tour.name} ({tour.currentMembersCount}/{tour.maxCapacity})
                        </option>
                      ))}
                    </select>
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
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      名 *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      姓 *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      出生日期 *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">
                      护照号码 *
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      id="passportNumber"
                      required
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 联系信息 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">联系信息</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                      邮箱
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                      联系电话
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                      紧急联系人姓名
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700">
                      紧急联系人电话
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 特殊需求 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">特殊需求</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="healthNotes" className="block text-sm font-medium text-gray-700">
                      健康备注
                    </label>
                    <textarea
                      name="healthNotes"
                      id="healthNotes"
                      rows={3}
                      value={formData.healthNotes}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="请填写任何健康相关的注意事项"
                    />
                  </div>

                  <div>
                    <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700">
                      饮食限制
                    </label>
                    <textarea
                      name="dietaryRestrictions"
                      id="dietaryRestrictions"
                      rows={3}
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="请填写任何饮食限制或过敏信息"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/members"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '添加中...' : '添加团员'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 
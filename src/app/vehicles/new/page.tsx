'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Occupation {
  type: string
  startDate?: string
  endDate?: string
}

export default function NewVehiclePage() {
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: '大巴',
    make: '',
    model: '',
    capacity: 50,
    year: new Date().getFullYear(),
    notes: ''
  })
  const [occupations, setOccupations] = useState<Occupation[]>([
    { type: '使用' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          occupations
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '创建失败')
        setLoading(false)
        return
      }
      setSuccess('车辆添加成功！')
      setTimeout(() => {
        router.push('/vehicles')
      }, 1200)
    } catch (err) {
      setError('网络或服务器错误')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOccupationChange = (index: number, field: string, value: string) => {
    const newOccupations = [...occupations]
    newOccupations[index] = { ...newOccupations[index], [field]: value }
    setOccupations(newOccupations)
  }

  const addOccupation = () => {
    setOccupations([...occupations, { type: '使用' }])
  }

  const removeOccupation = (index: number) => {
    if (occupations.length > 1) {
      const newOccupations = occupations.filter((_, i) => i !== index)
      setOccupations(newOccupations)
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
                添加车辆
              </h1>
              <p className="text-gray-600">
                为旅行社添加新的车辆资源
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/vehicles"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回车辆列表
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本信息 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
                  
                  <div>
                    <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      车牌号 *
                    </label>
                    <input
                      type="text"
                      id="plateNumber"
                      name="plateNumber"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.plateNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      车辆类型 *
                    </label>
                    <select
                      id="type"
                      name="type"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="轿车">轿车</option>
                      <option value="商务车">商务车</option>
                      <option value="中巴">中巴</option>
                      <option value="大巴">大巴</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                      品牌 *
                    </label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.make}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      型号 *
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      载客量 *
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      年份 *
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* 车辆状态历史 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">车辆状态历史</h3>
                    <button
                      type="button"
                      onClick={addOccupation}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                    >
                      添加状态
                    </button>
                  </div>
                  
                  {occupations.map((occupation, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">状态记录 {index + 1}</span>
                        {occupations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOccupation(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          状态类型 *
                        </label>
                        <select
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={occupation.type}
                          onChange={(e) => handleOccupationChange(index, 'type', e.target.value)}
                          required
                        >
                          <option value="使用">使用</option>
                          <option value="维修">维修</option>
                          <option value="保养">保养</option>
                          <option value="事故">事故</option>
                          <option value="待命">待命</option>
                          <option value="报废">报废</option>
                          <option value="租赁">租赁</option>
                          <option value="检测">检测</option>
                        </select>
                      </div>

                      {occupation.type !== '使用' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              开始日期 *
                            </label>
                            <input
                              type="date"
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={occupation.startDate || ''}
                              onChange={(e) => handleOccupationChange(index, 'startDate', e.target.value)}
                              required={occupation.type !== '使用'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              结束日期 *
                            </label>
                            <input
                              type="date"
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={occupation.endDate || ''}
                              onChange={(e) => handleOccupationChange(index, 'endDate', e.target.value)}
                              required={occupation.type !== '使用'}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="车辆特殊配置、注意事项等..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-green-600 text-sm">{success}</div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Link
                  href="/vehicles"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? '添加中...' : '添加车辆'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 
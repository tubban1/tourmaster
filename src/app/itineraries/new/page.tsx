'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Activity {
  day: number
  description: string
  hotelInfo: {
    name: string
    checkInTime: string
    checkOutTime: string
  }
  guides: {
    guideId: string
    vehicleId?: string
  }[]
}

interface FormData {
  name: string
  description: string
  durationDays: number
  destinations: string[]
  activities: Activity[]
  costEstimation: number
  inclusion: string[]
  exclusion: string[]
}

interface Guide {
  id: string
  name: string
  contactPhone: string
  languages: string[]
  specialties: string[]
  rating: number
  isActive: boolean
  userId?: string
}

interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
  type: string
  capacity: number
  isActive: boolean
}

export default function NewItineraryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [guides, setGuides] = useState<Guide[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    durationDays: 1,
    destinations: [''],
    activities: [],
    costEstimation: 0,
    inclusion: [''],
    exclusion: [''],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [guidesResponse, vehiclesResponse] = await Promise.all([
        fetch('/api/guides'),
        fetch('/api/vehicles')
      ])

      if (guidesResponse.ok) {
        const guidesData = await guidesResponse.json()
        setGuides(guidesData.filter((guide: Guide) => guide.isActive))
      }

      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        setVehicles(vehiclesData.filter((vehicle: Vehicle) => vehicle.isActive))
      }
    } catch (err) {
      setError('获取数据失败')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationDays' || name === 'costEstimation' ? Number(value) : value
    }))
  }

  const handleArrayChange = (field: keyof FormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }))
  }

  const addArrayItem = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }))
  }

  const removeArrayItem = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_: string, i: number) => i !== index)
    }))
  }

  // 处理activities相关操作
  const addActivity = () => {
    const newDay = formData.activities.length + 1
    const newActivity: Activity = {
      day: newDay,
      description: '',
      hotelInfo: {
        name: '',
        checkInTime: '15:00',
        checkOutTime: '12:00'
      },
      guides: []
    }
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }))
  }

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index).map((activity, i) => ({
        ...activity,
        day: i + 1
      }))
    }))
  }

  const updateActivity = (index: number, field: keyof Activity, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }))
  }

  const updateActivityHotel = (index: number, field: keyof Activity['hotelInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { 
          ...activity, 
          hotelInfo: { 
            ...activity.hotelInfo, 
            [field]: value 
          } 
        } : activity
      )
    }))
  }

  const addGuideToActivity = (activityIndex: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === activityIndex ? {
          ...activity,
          guides: [...activity.guides, { guideId: '', vehicleId: '' }]
        } : activity
      )
    }))
  }

  const removeGuideFromActivity = (activityIndex: number, guideIndex: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === activityIndex ? {
          ...activity,
          guides: activity.guides.filter((_, gi) => gi !== guideIndex)
        } : activity
      )
    }))
  }

  const updateGuideInActivity = (activityIndex: number, guideIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === activityIndex ? {
          ...activity,
          guides: activity.guides.map((guide, gi) => 
            gi === guideIndex ? { ...guide, [field]: value } : guide
          )
        } : activity
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 过滤空值
      const cleanData = {
        ...formData,
        destinations: formData.destinations.filter(d => d.trim()),
        inclusion: formData.inclusion.filter(i => i.trim()),
        exclusion: formData.exclusion.filter(e => e.trim()),
        activities: formData.activities.map(activity => ({
          ...activity,
          guides: activity.guides.filter(guide => guide.guideId.trim())
        }))
      }

      const response = await fetch('/api/itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建失败')
      }

      setSuccess('行程创建成功！')
      setTimeout(() => {
        router.push('/itineraries')
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
                新建行程
              </h1>
              <p className="text-gray-600">
                创建可复用的行程模板
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/itineraries"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                取消
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex gap-6">
            {/* 主要内容区域 */}
            <div className="flex-1 space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
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
                          行程名称 *
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
                        <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
                          行程天数 *
                        </label>
                        <input
                          type="number"
                          name="durationDays"
                          id="durationDays"
                          required
                          min="1"
                          value={formData.durationDays}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="costEstimation" className="block text-sm font-medium text-gray-700">
                          估算成本 (元) *
                        </label>
                        <input
                          type="number"
                          name="costEstimation"
                          id="costEstimation"
                          required
                          min="0"
                          step="0.01"
                          value={formData.costEstimation}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          行程描述 *
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          required
                          rows={4}
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 每日活动安排 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">每日活动安排</h2>
                      <button
                        type="button"
                        onClick={addActivity}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 text-sm"
                      >
                        + 添加活动
                      </button>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-6">
                      {formData.activities.map((activity, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              第 {activity.day} 天
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeActivity(index)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              删除活动
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {/* 活动描述 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                活动内容 *
                              </label>
                              <textarea
                                value={activity.description}
                                onChange={(e) => updateActivity(index, 'description', e.target.value)}
                                required
                                rows={3}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="描述当天的活动安排..."
                              />
                            </div>

                            {/* 酒店信息 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  酒店名称
                                </label>
                                <input
                                  type="text"
                                  value={activity.hotelInfo?.name || ''}
                                  onChange={(e) => updateActivityHotel(index, 'name', e.target.value)}
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  placeholder="酒店名称"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  入住时间
                                </label>
                                <input
                                  type="time"
                                  value={activity.hotelInfo?.checkInTime || '15:00'}
                                  onChange={(e) => updateActivityHotel(index, 'checkInTime', e.target.value)}
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  退房时间
                                </label>
                                <input
                                  type="time"
                                  value={activity.hotelInfo?.checkOutTime || '12:00'}
                                  onChange={(e) => updateActivityHotel(index, 'checkOutTime', e.target.value)}
                                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                            </div>

                            {/* 导游安排 */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  导游安排
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addGuideToActivity(index)}
                                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                                >
                                  + 添加导游
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(activity.guides || []).map((guide, guideIndex) => (
                                  <div key={guideIndex} className="flex items-center space-x-2">
                                    <select
                                      value={guide.guideId}
                                      onChange={(e) => updateGuideInActivity(index, guideIndex, 'guideId', e.target.value)}
                                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                      <option value="">请选择导游</option>
                                      {guides.map(g => (
                                        <option key={g.id} value={g.id}>{g.name} - {g.userId || '无账号'}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={guide.vehicleId || ''}
                                      onChange={(e) => updateGuideInActivity(index, guideIndex, 'vehicleId', e.target.value)}
                                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    >
                                      <option value="">请选择车辆</option>
                                      {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                          {v.make} {v.model} - {v.plateNumber}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() => removeGuideFromActivity(index, guideIndex)}
                                      className="text-red-600 hover:text-red-900 text-sm"
                                    >
                                      删除
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {formData.activities.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          暂无活动安排，点击&quot;添加活动&quot;开始创建
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 目的地 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">目的地</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {formData.destinations.map((destination, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleArrayChange('destinations', index, e.target.value)}
                            placeholder="输入目的地"
                            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {formData.destinations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('destinations', index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('destinations')}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        + 添加目的地
                      </button>
                    </div>
                  </div>
                </div>

                {/* 包含项目 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">包含项目</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {formData.inclusion.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('inclusion', index, e.target.value)}
                            placeholder="输入包含项目"
                            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {formData.inclusion.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('inclusion', index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('inclusion')}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        + 添加包含项目
                      </button>
                    </div>
                  </div>
                </div>

                {/* 不包含项目 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">不包含项目</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {formData.exclusion.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayChange('exclusion', index, e.target.value)}
                            placeholder="输入不包含项目"
                            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {formData.exclusion.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('exclusion', index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem('exclusion')}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        + 添加不包含项目
                      </button>
                    </div>
                  </div>
                </div>

                {/* 旅行团绑定（已移除） */}

                {/* 提交按钮 */}
                <div className="flex justify-end space-x-4">
                  <Link
                    href="/itineraries"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    取消
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? '创建中...' : '创建行程'}
                  </button>
                </div>
              </form>
            </div>

            {/* 侧边栏 */}
            <div className="w-80 space-y-6">
              {/* 快速操作 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <Link
                    href="/itineraries"
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                  >
                    返回列表
                  </Link>
                  <button
                    type="submit"
                    form="itinerary-form"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 text-center block"
                  >
                    {loading ? '创建中...' : '创建行程'}
                  </button>
                </div>
              </div>

              {/* 资源统计 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">资源统计</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">可用导游</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guides.length} 名
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">可用车辆</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicles.length} 辆
                    </span>
                  </div>
                  {/* 旅行团统计（已移除） */}
                </div>
              </div>

              {/* 创建进度 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">创建进度</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">基本信息</span>
                    <span className={`text-sm font-medium ${formData.name && formData.description ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.name && formData.description ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">活动安排</span>
                    <span className={`text-sm font-medium ${formData.activities.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.activities.length > 0 ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">目的地</span>
                    <span className={`text-sm font-medium ${formData.destinations.length > 0 && formData.destinations[0] ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.destinations.length > 0 && formData.destinations[0] ? '✓' : '○'}
                    </span>
                  </div>
                  {/* 旅行团绑定进度（已移除） */}
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg">
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">创建提示</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 填写基本信息</li>
                    <li>• 添加每日活动</li>
                    <li>• 设置目的地</li>
                    <li>• 选择包含项目</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
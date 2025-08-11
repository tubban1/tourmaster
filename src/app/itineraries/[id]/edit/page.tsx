'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Itinerary {
  id: string
  name: string
  description: string
  durationDays: number
  destinations: string[]
  activities: DaySchedule[]
  costEstimation: number
  inclusion: string[]
  exclusion: string[]
  isActive: boolean
  tourId?: string // 添加旅行团ID字段
}

interface DaySchedule {
  day: number
  description: string
  hotelInfo?: {
    name?: string
    checkInTime?: string
    checkOutTime?: string
  }
  guides: GuideAssignment[]
}

interface GuideAssignment {
  guideId: string
  vehicleId?: string | null
  guideAccommodation?: string // 简化为单一酒店名称字符串
  notes?: string
}

interface TourGuide {
  id: string
  name: string
  contactPhone: string
  email: string
  languages: string[]
  specialties: string[]
  rating: number
}

interface Vehicle {
  id: string
  plateNumber: string
  type: string
  make: string
  model: string
  capacity: number
}

export default function ItineraryEditPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [guides, setGuides] = useState<TourGuide[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [isBoundToTour, setIsBoundToTour] = useState(false)
  const [boundTourId, setBoundTourId] = useState<string>('')

  // 表单状态
  const [formData, setFormData] = useState<{
    name: string
    description: string
    durationDays: number
    destinations: string[]
    costEstimation: number
    inclusion: string[]
    exclusion: string[]
    isActive: boolean
    activities: DaySchedule[]
    tourId?: string
  }>({
    name: '',
    description: '',
    durationDays: 1,
    destinations: [''],
    costEstimation: 0,
    inclusion: [''],
    exclusion: [''],
    isActive: true,
    activities: [],
    tourId: ''
  })

  useEffect(() => {
    if (id) {
      fetchItineraryData()
      fetchGuides()
      fetchVehicles()
      checkTourBinding()
    }
  }, [id])

  const checkTourBinding = async () => {
    try {
      // 查询tours表，看是否有tour的itineraryId等于当前行程ID
      const response = await fetch('/api/tours')
      if (response.ok) {
        const data = await response.json()
        
        // 根据API返回的数据结构，直接使用data数组
        const toursArray = Array.isArray(data) ? data : (data.tours || [])
        
        const boundTour = toursArray.find((tour: any) => tour.itineraryId === id)
        
        if (boundTour) {
          setIsBoundToTour(true)
          setBoundTourId(boundTour.id)
        } else {
          setIsBoundToTour(false)
          setBoundTourId('')
        }
      }
    } catch (error) {
      console.error('查询旅行团绑定状态失败:', error)
    }
  }

  const fetchItineraryData = async () => {
    try {
      const response = await fetch(`/api/itineraries/${id}`)
      if (response.ok) {
        const data = await response.json()
        setItinerary(data)
        setFormData({
          name: data.name,
          description: data.description,
          durationDays: data.durationDays,
          destinations: data.destinations,
          costEstimation: data.costEstimation,
          inclusion: data.inclusion,
          exclusion: data.exclusion,
          isActive: data.isActive,
          activities: data.activities || [],
          tourId: data.tourId || ''
        })
      } else {
        setError('获取行程信息失败')
      }
    } catch (error) {
      console.error('获取行程信息失败:', error)
      setError('获取行程信息失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/guides')
      if (response.ok) {
        const data = await response.json()
        // 参考详情页的做法，直接使用data数组并过滤活跃导游
        const guidesArray = Array.isArray(data) ? data : (data.guides || [])
        const activeGuides = guidesArray.filter((guide: any) => guide.isActive)
        console.log('获取到的导游数据:', activeGuides)
        setGuides(activeGuides)
      }
    } catch (error) {
      console.error('获取导游信息失败:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        // 参考详情页的做法，直接使用data数组并过滤活跃车辆
        const vehiclesArray = Array.isArray(data) ? data : (data.vehicles || [])
        const activeVehicles = vehiclesArray.filter((vehicle: any) => vehicle.isActive)
        console.log('获取到的车辆数据:', activeVehicles)
        setVehicles(activeVehicles)
      }
    } catch (error) {
      console.error('获取车辆信息失败:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }



  // 每日行程相关函数
  const updateActivity = (dayIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, index) => 
        index === dayIndex ? { ...activity, [field]: value } : activity
      )
    }))
  }

  const updateHotelInfo = (dayIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, index) => 
        index === dayIndex ? { 
          ...activity, 
          hotelInfo: { 
            ...activity.hotelInfo, 
            [field]: value 
          } 
        } : activity
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/itineraries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push(`/itineraries/${id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || '保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      setError('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-500 mb-4">{error || '行程不存在'}</p>
          <Link
            href="/itineraries"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            返回行程列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">编辑行程</h1>
              <p className="text-sm text-gray-500 mt-1">修改行程信息和每日安排</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/itineraries/${id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                form="itinerary-form"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <form id="itinerary-form" onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
              </div>
            <div className="px-6 py-4 space-y-4">
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  行程名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  行程描述 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                    行程天数 *
                                      </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => handleInputChange('durationDays', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                    费用预估 (¥)
                                      </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costEstimation}
                    onChange={(e) => handleInputChange('costEstimation', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                                      </label>
                <select
                  value={formData.isActive.toString()}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">启用</option>
                  <option value="false">禁用</option>
                </select>
                                      </div>
                                    </div>
                                  </div>

          {/* 目的地 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">目的地</h2>
                                </div>
            <div className="px-6 py-4 space-y-3">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => handleArrayChange('destinations', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="输入目的地名称"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('destinations', index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                    disabled={formData.destinations.length === 1}
                  >
                    删除
                  </button>
                      </div>
                    ))}
              <button
                type="button"
                onClick={() => addArrayItem('destinations')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                + 添加目的地
              </button>
                  </div>
                </div>

            {/* 包含项目 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">包含项目</h2>
                </div>
            <div className="px-6 py-4 space-y-3">
              {formData.inclusion.map((item, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('inclusion', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="输入包含项目"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('inclusion', index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                    disabled={formData.inclusion.length === 1}
                  >
                    删除
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('inclusion')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                + 添加包含项目
              </button>
                </div>
              </div>

            {/* 不包含项目 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">不包含项目</h2>
                </div>
            <div className="px-6 py-4 space-y-3">
              {formData.exclusion.map((item, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('exclusion', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="输入不包含项目"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('exclusion', index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                    disabled={formData.exclusion.length === 1}
                  >
                    删除
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('exclusion')}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                + 添加不包含项目
              </button>
              </div>
          </div>

          {/* 每日行程安排 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">每日行程安排</h2>
            </div>
            <div className="px-6 py-4 space-y-6">
              {formData.activities.map((activity, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      第 {activity.day} 天
                    </h3>
                    
                    {/* 每日行程描述 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        行程描述
                      </label>
                      <textarea
                        value={activity.description}
                        onChange={(e) => updateActivity(dayIndex, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="描述当天的行程安排"
                      />
              </div>

                    {/* 酒店信息 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        酒店信息
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">酒店名称</label>
                          <input
                            type="text"
                            value={activity.hotelInfo?.name || ''}
                            onChange={(e) => updateHotelInfo(dayIndex, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="酒店名称"
                          />
                </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">入住时间</label>
                          <input
                            type="text"
                            value={activity.hotelInfo?.checkInTime || ''}
                            onChange={(e) => updateHotelInfo(dayIndex, 'checkInTime', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="15:00"
                          />
                </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">退房时间</label>
                          <input
                            type="text"
                            value={activity.hotelInfo?.checkOutTime || ''}
                            onChange={(e) => updateHotelInfo(dayIndex, 'checkOutTime', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="12:00"
                          />
                </div>
              </div>
            </div>

                                        {/* 导游安排 */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          导游安排
                        </label>
                        {isBoundToTour ? (
                          <Link
                            href={`/scheduling/${boundTourId}`}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            查看导游安排
                          </Link>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            绑定旅行团后安排导游
                          </span>
                        )}
              </div>
                      
                                            {isBoundToTour ? (
                        <div className="space-y-3">
                          {activity.guides && activity.guides.length > 0 ? (
                            activity.guides.map((guide, guideIndex) => (
                              <div key={guideIndex} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                <div className="space-y-2">
                                                                    {/* 导游信息 */}
                                  <div className="flex items-center space-x-2 text-sm">
                                    <span className="text-blue-600 font-medium">
                                      👤 {guides.find(g => g.id === guide.guideId)?.name || '未知导游'}
                                    </span>
                                    {guide.vehicleId && (
                                      <span className="text-green-600 font-medium">
                                        🚗 {vehicles.find(v => v.id === guide.vehicleId)?.plateNumber || '未知车牌'} 
                                        {vehicles.find(v => v.id === guide.vehicleId)?.model && (
                                          <span className="text-gray-500 ml-1">
                                            ({vehicles.find(v => v.id === guide.vehicleId)?.model})
                                          </span>
                                        )}
                  </span>
                                    )}
                                  </div>
                                  
                                  {/* 导游住宿安排 */}
                                  {guide.guideAccommodation && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">🏨 住宿安排:</span> {guide.guideAccommodation}
                                    </div>
                                  )}
                                  
                                  {/* 备注 */}
                                  {guide.notes && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">📝 备注:</span> {guide.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm py-2">
                              该天暂无导游安排
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm py-2">
                          请先绑定旅行团，然后在此页面安排导游
                </div>
                      )}
                </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/itineraries/${id}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
        </div>
        </form>
      </main>
    </div>
  )
}
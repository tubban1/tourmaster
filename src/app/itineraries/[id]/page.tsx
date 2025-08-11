'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
    vehicleId?: string | null
    guideAccommodation?: string // 简化为单一酒店名称字符串
    notes?: string
  }[]
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

interface Itinerary {
  id: string
  name: string
  description: string
  durationDays: number
  destinations: string[]
  activities: Activity[]
  costEstimation: number
  inclusion: string[]
  exclusion: string[]
  isActive: boolean
  createdAt: string
  createdBy: string
  creator: {
    username: string
  }
  agency: {
    name: string
  }
  boundTour?: {
    id: string
    name: string
    status: string
    maxCapacity: number
    currentMembersCount: number
    salesManager: {
      username: string
      email: string
    }
    createdAt: string
  }
}

export default function ItineraryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itineraryId = params.id as string
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    fetchItineraryDetails()
    fetchGuides()
    fetchVehicles()
  }, [itineraryId])

  const fetchItineraryDetails = async () => {
    try {
      const response = await fetch(`/api/itineraries/${itineraryId}`)
      if (!response.ok) {
        throw new Error('获取行程信息失败')
      }
      const data = await response.json()
      setItinerary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/guides')
      if (response.ok) {
        const data = await response.json()
        setGuides(data.filter((guide: Guide) => guide.isActive))
      }
    } catch (err) {
      console.error('获取导游失败:', err)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.filter((vehicle: Vehicle) => vehicle.isActive))
      }
    } catch (err) {
      console.error('获取车辆失败:', err)
    }
  }



  // 获取导游和车辆信息的辅助函数
  const getGuideInfo = (guideId: string) => {
    const guide = guides.find(g => g.id === guideId)
    return guide ? `${guide.name} - ${guide.languages.join(', ')} (${guide.rating}星)` : `导游ID: ${guideId}`
  }

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.plateNumber} (${vehicle.capacity}人)` : `车辆ID: ${vehicleId}`
  }

  // 获取行程的导游和车辆数量
  const getResourceCount = (itinerary: Itinerary) => {
    const guideIds = new Set<string>()
    const vehicleIds = new Set<string>()
    
    itinerary.activities.forEach(activity => {
      if (activity.guides && Array.isArray(activity.guides)) {
        activity.guides.forEach(guide => {
          if (guide.guideId) guideIds.add(guide.guideId)
          if (guide.vehicleId) vehicleIds.add(guide.vehicleId)
        })
      }
    })
    
    return {
      guides: guideIds.size,
      vehicles: vehicleIds.size
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">行程不存在</div>
      </div>
    )
  }

  const resourceCount = getResourceCount(itinerary)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                行程详情
              </h1>
              <p className="text-gray-600">
                {itinerary.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/itineraries"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回列表
              </Link>
              <Link
                href={`/itineraries/${itineraryId}/edit`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                编辑
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">行程名称</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">状态</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          itinerary.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {itinerary.isActive ? '启用' : '禁用'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">行程天数</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.durationDays} 天</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">估算成本</dt>
                      <dd className="mt-1 text-sm text-gray-900">¥{itinerary.costEstimation.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">导游数量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{resourceCount.guides} 名</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">车辆数量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{resourceCount.vehicles} 辆</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">行程描述</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.description}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 绑定旅行团信息 */}
              {itinerary.boundTour && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">绑定旅行团</h2>
                  </div>
                  <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">旅行团名称</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <Link 
                            href={`/tours/${itinerary.boundTour.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {itinerary.boundTour.name}
                          </Link>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">状态</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            itinerary.boundTour.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                            itinerary.boundTour.status === 'paid' ? 'bg-green-100 text-green-800' :
                            itinerary.boundTour.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {itinerary.boundTour.status === 'planned' ? '计划中' :
                             itinerary.boundTour.status === 'paid' ? '已付款' :
                             itinerary.boundTour.status === 'completed' ? '已完成' :
                             '已取消'}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">容量</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {itinerary.boundTour.currentMembersCount}/{itinerary.boundTour.maxCapacity} 人
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">销售经理</dt>
                        <dd className="mt-1 text-sm text-gray-900">{itinerary.boundTour.salesManager.username}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(itinerary.boundTour.createdAt).toLocaleDateString('zh-CN')}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* 每日活动安排 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">每日活动安排</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-6">
                    {itinerary.activities.map((activity, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            第 {activity.day} 天
                          </h3>
                          <span className="text-sm text-gray-500">
                            {(activity.guides || []).length} 名导游
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">活动内容:</span>
                            <p className="mt-1 text-sm text-gray-900">{activity.description}</p>
                          </div>
                          
                          {activity.hotelInfo && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">酒店信息:</span>
                              <div className="mt-1 text-sm text-gray-900">
                                <div>{activity.hotelInfo.name}</div>
                                <div className="text-gray-500">
                                  入住: {activity.hotelInfo.checkInTime} | 退房: {activity.hotelInfo.checkOutTime}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {(activity.guides || []).length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">导游安排:</span>
                              <div className="mt-1 space-y-2">
                                {(activity.guides || []).map((guide, guideIndex) => (
                                  <div key={guideIndex} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 text-sm">
                                        <span className="text-blue-600">👤 {getGuideInfo(guide.guideId)}</span>
                                        {guide.vehicleId && (
                                          <span className="text-green-600">🚗 {getVehicleInfo(guide.vehicleId)}</span>
                                        )}
                                      </div>
                                      
                                                                        {guide.guideAccommodation && (
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">🏨 住宿安排:</span> {guide.guideAccommodation}
                                    </div>
                                  )}
                                      
                                      {guide.notes && (
                                        <div className="text-sm text-gray-600">
                                          <span className="font-medium">📝 备注:</span> {guide.notes}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 目的地 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">目的地</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {itinerary.destinations.map((destination, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 包含项目 */}
              {itinerary.inclusion.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">包含项目</h2>
                  </div>
                  <div className="px-6 py-4">
                    <ul className="space-y-2">
                      {itinerary.inclusion.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm text-gray-900">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 不包含项目 */}
              {itinerary.exclusion.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">不包含项目</h2>
                  </div>
                  <div className="px-6 py-4">
                    <ul className="space-y-2">
                      {itinerary.exclusion.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span className="text-sm text-gray-900">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 创建信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">创建信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">创建者</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.creator.username}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">所属旅行社</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.agency?.name || '未知旅行社'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(itinerary.createdAt).toLocaleDateString('zh-CN')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">统计信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">目的地数量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.destinations.length} 个</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">包含项目</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.inclusion.length} 项</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">不包含项目</dt>
                      <dd className="mt-1 text-sm text-gray-900">{itinerary.exclusion.length} 项</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">导游数量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{resourceCount.guides} 名</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">车辆数量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{resourceCount.vehicles} 辆</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    <Link
                      href={`/itineraries/${itineraryId}/edit`}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                    >
                      编辑行程
                    </Link>
                    <Link
                      href="/itineraries"
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                    >
                      返回列表
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
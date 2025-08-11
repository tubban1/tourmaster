'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Tour {
  id: string
  name: string
  status: string
  maxCapacity: number
  currentMembersCount: number

  itinerary?: {
    name: string
    description: string
    durationDays: number
    destinations: string[]
    costEstimation: number
  }
  notes?: string
  overallArrivalTime?: string
  overallDepartureTime?: string
  pickupSignInfo?: string
  flightDetails?: any
  createdAt: string
  updatedAt: string
}

interface TourMember {
  id: string
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  passportNumber: string
  contactEmail: string
  contactPhone: string
  emergencyContactName: string
  emergencyContactPhone: string
  healthNotes?: string
  dietaryRestrictions?: string
}

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tourId = params.id as string
  
  const [tour, setTour] = useState<Tour | null>(null)
  const [members, setMembers] = useState<TourMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    fetchTourDetails()
  }, [tourId])

  const fetchTourDetails = async () => {
    try {
      const [tourResponse, membersResponse] = await Promise.all([
        fetch(`/api/tours/${tourId}`),
        fetch(`/api/tours/${tourId}/members`)
      ])

      if (!tourResponse.ok) {
        throw new Error('获取旅行团信息失败')
      }

      const tourData = await tourResponse.json()
      setTour(tourData)

      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return '计划中'
      case 'paid':
        return '已付款'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return status
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

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">旅行团不存在</div>
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
                旅行团详情
              </h1>
              <p className="text-gray-600">
                {tour.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/tours"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回列表
              </Link>
              <Link
                href={`/tours/${tourId}/edit`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                编辑
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 基本信息 */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">团名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tour.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">状态</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                          {getStatusText(tour.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">最大容量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tour.maxCapacity} 人</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">当前人数</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tour.currentMembersCount} 人</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(tour.createdAt).toLocaleDateString('zh-CN')}
                      </dd>
                    </div>
                    {tour.overallArrivalTime && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">抵达时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(tour.overallArrivalTime).toLocaleString('zh-CN')}
                        </dd>
                      </div>
                    )}
                    {tour.overallDepartureTime && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">送机时间</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(tour.overallDepartureTime).toLocaleString('zh-CN')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* 行程信息 */}
              <div className="bg-white shadow rounded-lg mt-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">行程信息</h2>
                </div>
                {tour.itinerary ? (
                  <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">行程名称</dt>
                        <dd className="mt-1 text-sm text-gray-900">{tour.itinerary?.name || '未设置'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">行程天数</dt>
                        <dd className="mt-1 text-sm text-gray-900">{tour.itinerary?.durationDays || 0} 天</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">目的地</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {tour.itinerary.destinations && Array.isArray(tour.itinerary.destinations) 
                            ? tour.itinerary.destinations.join(' → ')
                            : '未设置目的地'
                          }
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">描述</dt>
                        <dd className="mt-1 text-sm text-gray-900">{tour.itinerary?.description || '未设置描述'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">估算成本</dt>
                        <dd className="mt-1 text-sm text-gray-900">¥{tour.itinerary?.costEstimation || 0}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-500">未绑定行程</p>
                  </div>
                )}
              </div>

              {/* 航班信息 */}
              {tour.flightDetails && (
                <div className="bg-white shadow rounded-lg mt-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">航班信息</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {/* 去程航班 */}
                      {tour.flightDetails.outboundFlight && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">去程航班</h3>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-900">
                              {tour.flightDetails.outboundFlight.airline || '未设置'} {tour.flightDetails.outboundFlight.flightNumber || '未设置'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {tour.flightDetails.outboundFlight.departureAirport || '未设置'} → {tour.flightDetails.outboundFlight.arrivalAirport || '未设置'}
                            </p>
                            {tour.flightDetails.outboundFlight.departureTime && (
                              <p className="text-sm text-gray-600">
                                起飞: {new Date(tour.flightDetails.outboundFlight.departureTime).toLocaleString('zh-CN')}
                              </p>
                            )}
                            {tour.flightDetails.outboundFlight.arrivalTime && (
                              <p className="text-sm text-gray-600">
                                到达: {new Date(tour.flightDetails.outboundFlight.arrivalTime).toLocaleString('zh-CN')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 返程航班 */}
                      {tour.flightDetails.returnFlight && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">返程航班</h3>
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm text-gray-900">
                              {tour.flightDetails.returnFlight.airline || '未设置'} {tour.flightDetails.returnFlight.flightNumber || '未设置'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {tour.flightDetails.returnFlight.departureAirport || '未设置'} → {tour.flightDetails.returnFlight.arrivalAirport || '未设置'}
                            </p>
                            {tour.flightDetails.returnFlight.departureTime && (
                              <p className="text-sm text-gray-600">
                                起飞: {new Date(tour.flightDetails.returnFlight.departureTime).toLocaleString('zh-CN')}
                              </p>
                            )}
                            {tour.flightDetails.returnFlight.arrivalTime && (
                              <p className="text-sm text-gray-600">
                                到达: {new Date(tour.flightDetails.returnFlight.arrivalTime).toLocaleString('zh-CN')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 如果没有航班信息 */}
                      {!tour.flightDetails.outboundFlight && !tour.flightDetails.returnFlight && (
                        <p className="text-sm text-gray-500">暂无航班信息</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                    href={`/tours/${tourId}/edit`}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                  >
                    编辑旅行团
                  </Link>
                  <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                    添加团员
                  </button>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    查看行程
                  </button>
                </div>
              </div>

              {/* 团员列表 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">团员列表</h2>
                    <span className="text-sm text-gray-500">{members.length} 人</span>
                  </div>
                </div>
                <div className="px-6 py-4">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无团员</p>
                  ) : (
                    <div className="space-y-3">
                      {members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{member.passportNumber}</p>
                          </div>
                          <span className="text-xs text-gray-500">{member.gender}</span>
                        </div>
                      ))}
                      {members.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          还有 {members.length - 5} 人...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 备注信息 */}
              {tour.notes && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">备注</h2>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-900">{tour.notes}</p>
                  </div>
                </div>
              )}

              {/* 时间信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">时间信息</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {tour.overallArrivalTime && (
                    <div>
                      <p className="text-xs text-gray-500">整体抵达时间</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(tour.overallArrivalTime).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                  {tour.overallDepartureTime && (
                    <div>
                      <p className="text-xs text-gray-500">整体送机时间</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(tour.overallDepartureTime).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                  {tour.pickupSignInfo && (
                    <div>
                      <p className="text-xs text-gray-500">接机信息</p>
                      <p className="text-sm font-medium text-gray-900">{tour.pickupSignInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  )
} 
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

  itineraryId?: string
  notes?: string
  overallArrivalTime?: string
  overallDepartureTime?: string
  pickupSignInfo?: string
  flightDetails?: any
}

interface Itinerary {
  id: string
  name: string
  description: string
  durationDays: number
  destinations: string[]
  costEstimation: number
  isActive: boolean
}

export default function TourEditPage() {
  const router = useRouter()
  const params = useParams()
  const tourId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tour, setTour] = useState<Tour | null>(null)
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    maxCapacity: 0,
    itineraryId: '',
    notes: '',
    overallArrivalTime: '',
    overallDepartureTime: '',
    pickupSignInfo: '',
    flightDetails: {
      outboundFlight: {
        flightNumber: '',
        airline: '',
        departureAirport: '',
        arrivalAirport: '',
        departureTime: '',
        arrivalTime: ''
      },
      returnFlight: {
        flightNumber: '',
        airline: '',
        departureAirport: '',
        arrivalAirport: '',
        departureTime: '',
        arrivalTime: ''
      }
    }
  })

  useEffect(() => {
    fetchTourData()
  }, [tourId])

  const fetchTourData = async () => {
    try {
      const [tourResponse, itinerariesResponse] = await Promise.all([
        fetch(`/api/tours/${tourId}`),
        fetch('/api/itineraries')
      ])

      if (!tourResponse.ok) {
        throw new Error('获取旅行团信息失败')
      }

      const tourData = await tourResponse.json()
      setTour(tourData)

      if (itinerariesResponse.ok) {
        const itinerariesData = await itinerariesResponse.json()
        // 获取所有可用行程：未绑定的 + 当前旅行团已绑定的
        const availableItineraries = itinerariesData.filter((it: Itinerary) => 
          it.isActive
        )
        setItineraries(availableItineraries)
      }

      setFormData({
        name: tourData.name,
        status: tourData.status,
        maxCapacity: tourData.maxCapacity,
        itineraryId: tourData.itineraryId || '',
        notes: tourData.notes || '',
        overallArrivalTime: tourData.overallArrivalTime ? tourData.overallArrivalTime.slice(0, 16) : '',
        overallDepartureTime: tourData.overallDepartureTime ? tourData.overallDepartureTime.slice(0, 16) : '',
        pickupSignInfo: tourData.pickupSignInfo || '',
        flightDetails: tourData.flightDetails || {
          outboundFlight: {
            flightNumber: '',
            airline: '',
            departureAirport: '',
            arrivalAirport: '',
            departureTime: '',
            arrivalTime: ''
          },
          returnFlight: {
            flightNumber: '',
            airline: '',
            departureAirport: '',
            arrivalAirport: '',
            departureTime: '',
            arrivalTime: ''
          }
        }
      })

      // 如果有航班数据，处理时间字段
      if (tourData.flightDetails) {
        if (tourData.flightDetails.outboundFlight) {
          if (tourData.flightDetails.outboundFlight.departureTime) {
            setFormData(prev => ({
              ...prev,
              flightDetails: {
                ...prev.flightDetails,
                outboundFlight: {
                  ...prev.flightDetails.outboundFlight,
                  departureTime: tourData.flightDetails.outboundFlight.departureTime.slice(0, 16)
                }
              }
            }))
          }
          if (tourData.flightDetails.outboundFlight.arrivalTime) {
            setFormData(prev => ({
              ...prev,
              flightDetails: {
                ...prev.flightDetails,
                outboundFlight: {
                  ...prev.flightDetails.outboundFlight,
                  arrivalTime: tourData.flightDetails.outboundFlight.arrivalTime.slice(0, 16)
                }
              }
            }))
          }
        }
        if (tourData.flightDetails.returnFlight) {
          if (tourData.flightDetails.returnFlight.departureTime) {
            setFormData(prev => ({
              ...prev,
              flightDetails: {
                ...prev.flightDetails,
                returnFlight: {
                  ...prev.flightDetails.returnFlight,
                  departureTime: tourData.flightDetails.returnFlight.departureTime.slice(0, 16)
                }
              }
            }))
          }
          if (tourData.flightDetails.returnFlight.arrivalTime) {
            setFormData(prev => ({
              ...prev,
              flightDetails: {
                ...prev.flightDetails,
                returnFlight: {
                  ...prev.flightDetails.returnFlight,
                  arrivalTime: tourData.flightDetails.returnFlight.arrivalTime.slice(0, 16)
                }
              }
            }))
          }
        }
      }
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
      [name]: value
    }))
  }

  const handleFlightDetailsChange = (flightType: 'outboundFlight' | 'returnFlight', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      flightDetails: {
        ...prev.flightDetails,
        [flightType]: {
          ...prev.flightDetails[flightType],
          [field]: value
        }
      }
    }))
  }

  const handleUnbindItinerary = async () => {
    if (!confirm('确定要解绑此行程吗？')) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/tours/${tourId}/bind-itinerary`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '解绑失败')
      }

      setSuccess('行程解绑成功')
      
      // 重新获取数据以更新界面
      setTimeout(() => {
        fetchTourData()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '解绑失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 检查行程绑定状态是否发生变化
      const currentItineraryId = tour?.itineraryId || ''
      const newItineraryId = formData.itineraryId
      
      let response
      
      // 只有当行程未绑定时才允许修改绑定关系
      if (!currentItineraryId && currentItineraryId !== newItineraryId) {
        // 行程绑定状态发生变化，需要调用绑定/解绑API
        if (newItineraryId) {
          // 绑定新行程
          response = await fetch(`/api/tours/${tourId}/bind-itinerary`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itineraryId: newItineraryId }),
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || '绑定操作失败')
          }
        }
      }
      
      // 更新旅行团基本信息
      const requestBody = {
        name: formData.name,
        status: formData.status,
        maxCapacity: formData.maxCapacity,
        notes: formData.notes,
        overallArrivalTime: formData.overallArrivalTime || undefined,
        overallDepartureTime: formData.overallDepartureTime || undefined,
        pickupSignInfo: formData.pickupSignInfo,
        flightDetails: formData.flightDetails
      }
      
      console.log('发送的数据:', requestBody)
      console.log('原始时间值:', {
        overallArrivalTime: formData.overallArrivalTime,
        overallDepartureTime: formData.overallDepartureTime
      })
      
      response = await fetch(`/api/tours/${tourId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '更新失败')
      }

      setSuccess('旅行团信息更新成功')
      
      // 重新获取数据以更新界面
      setTimeout(() => {
        fetchTourData()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error && !tour) {
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
                编辑旅行团
              </h1>
              <p className="text-gray-600">
                {tour?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/tours/${tourId}`}
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
            <div className="flex gap-6">
              {/* 主要内容区域 */}
              <div className="flex-1 space-y-6">
                {/* 基本信息 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          旅行团名称 *
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
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          状态 *
                        </label>
                        <select
                          name="status"
                          id="status"
                          required
                          value={formData.status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="planned">计划中</option>
                          <option value="paid">已付款</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700">
                          最大容量 *
                        </label>
                        <input
                          type="number"
                          name="maxCapacity"
                          id="maxCapacity"
                          required
                          min="1"
                          value={formData.maxCapacity}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="itineraryId" className="block text-sm font-medium text-gray-700">
                          绑定行程
                        </label>
                        <select
                          name="itineraryId"
                          id="itineraryId"
                          value={formData.itineraryId}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">选择行程（可选）</option>
                          {itineraries.map((itinerary) => (
                            <option key={itinerary.id} value={itinerary.id}>
                              {itinerary.name} ({itinerary.durationDays}天)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="overallArrivalTime" className="block text-sm font-medium text-gray-700">
                          整体抵达时间
                        </label>
                        <input
                          type="datetime-local"
                          name="overallArrivalTime"
                          id="overallArrivalTime"
                          value={formData.overallArrivalTime}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="overallDepartureTime" className="block text-sm font-medium text-gray-700">
                          整体送机时间
                        </label>
                        <input
                          type="datetime-local"
                          name="overallDepartureTime"
                          id="overallDepartureTime"
                          value={formData.overallDepartureTime}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="pickupSignInfo" className="block text-sm font-medium text-gray-700">
                          接机信息
                        </label>
                        <input
                          type="text"
                          name="pickupSignInfo"
                          id="pickupSignInfo"
                          value={formData.pickupSignInfo}
                          onChange={handleInputChange}
                          placeholder="接机人员信息"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
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

                {/* 航班信息 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">航班信息</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-6">
                      {/* 去程航班 */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">去程航班</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">航空公司</label>
                            <input
                              type="text"
                              value={formData.flightDetails.outboundFlight.airline}
                              onChange={(e) => handleFlightDetailsChange('outboundFlight', 'airline', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">航班号</label>
                            <input
                              type="text"
                              value={formData.flightDetails.outboundFlight.flightNumber}
                              onChange={(e) => handleFlightDetailsChange('outboundFlight', 'flightNumber', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">出发机场</label>
                            <input
                              type="text"
                              value={formData.flightDetails.outboundFlight.departureAirport}
                              onChange={(e) => handleFlightDetailsChange('outboundFlight', 'departureAirport', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">到达机场</label>
                            <input
                              type="text"
                              value={formData.flightDetails.outboundFlight.arrivalAirport}
                              onChange={(e) => handleFlightDetailsChange('outboundFlight', 'arrivalAirport', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">起飞时间</label>
                            <input
                              type="datetime-local"
                              value={formData.flightDetails.outboundFlight.departureTime}
                              onChange={(e) => handleFlightDetailsChange('outboundFlight', 'departureTime', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">到达时间</label>
                            <input
                              type="datetime-local"
                              value={formData.flightDetails.outboundFlight.arrivalTime}
                              onChange={(e) => handleFlightDetailsChange('outboundFlight', 'arrivalTime', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 返程航班 */}
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-4">返程航班</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">航空公司</label>
                            <input
                              type="text"
                              value={formData.flightDetails.returnFlight.airline}
                              onChange={(e) => handleFlightDetailsChange('returnFlight', 'airline', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">航班号</label>
                            <input
                              type="text"
                              value={formData.flightDetails.returnFlight.flightNumber}
                              onChange={(e) => handleFlightDetailsChange('returnFlight', 'flightNumber', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">出发机场</label>
                            <input
                              type="text"
                              value={formData.flightDetails.returnFlight.departureAirport}
                              onChange={(e) => handleFlightDetailsChange('returnFlight', 'departureAirport', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">到达机场</label>
                            <input
                              type="text"
                              value={formData.flightDetails.returnFlight.arrivalAirport}
                              onChange={(e) => handleFlightDetailsChange('returnFlight', 'arrivalAirport', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">起飞时间</label>
                            <input
                              type="datetime-local"
                              value={formData.flightDetails.returnFlight.departureTime}
                              onChange={(e) => handleFlightDetailsChange('returnFlight', 'departureTime', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">到达时间</label>
                            <input
                              type="datetime-local"
                              value={formData.flightDetails.returnFlight.arrivalTime}
                              onChange={(e) => handleFlightDetailsChange('returnFlight', 'arrivalTime', e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 侧边栏 */}
              <div className="w-80 space-y-6">
                {/* 操作按钮 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">操作</h2>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? '保存中...' : '保存更改'}
                    </button>
                    <Link
                      href={`/tours/${tourId}`}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                    >
                      取消
                    </Link>
                  </div>
                </div>

                {/* 当前状态 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">当前状态</h2>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">状态</p>
                      <p className="text-sm font-medium text-gray-900">{tour?.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">最大容量</p>
                      <p className="text-sm font-medium text-gray-900">{tour?.maxCapacity} 人</p>
                    </div>
                    {tour?.itineraryId && (
                      <div>
                        <p className="text-xs text-gray-500">已绑定行程</p>
                        <button
                          onClick={handleUnbindItinerary}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          解绑行程
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
} 
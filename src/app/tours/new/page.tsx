'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Itinerary {
  id: string
  name: string
  description: string
  durationDays: number
  destinations: string[]
  costEstimation: number
  isActive: boolean
}

export default function NewTourPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [formData, setFormData] = useState({
    name: '',
    status: 'planning',
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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const itinerariesResponse = await fetch('/api/itineraries?unbound=true')

      if (itinerariesResponse.ok) {
        const itinerariesData = await itinerariesResponse.json()
        setItineraries(itinerariesData.filter((it: Itinerary) => it.isActive))
      }
    } catch (err) {
      setError('获取数据失败')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxCapacity' ? Number(value) : value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          overallArrivalTime: formData.overallArrivalTime || undefined,
          overallDepartureTime: formData.overallDepartureTime || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '创建失败')
      }

      setSuccess('旅行团创建成功！')
      setTimeout(() => {
        router.push('/tours')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">新建旅行团</h1>
              <p className="text-gray-600">创建新的旅行团</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/tours" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                取消
              </Link>
            </div>
          </div>
        </div>
      </header>

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
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? '创建中...' : '创建旅行团'}
                    </button>
                    <Link
                      href="/tours"
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                    >
                      取消
                    </Link>
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="px-6 py-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">创建提示</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 基本信息为必填项</li>
                      <li>• 航班信息为可选项</li>
                      <li>• 创建后可继续添加团员</li>
                      <li>• 可随时编辑和修改</li>
                    </ul>
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
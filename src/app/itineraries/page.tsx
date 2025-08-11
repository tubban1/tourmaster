'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

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
}

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [copyingId, setCopyingId] = useState<string | null>(null)

  useEffect(() => {
    fetchItineraries()
  }, [])

  useEffect(() => {
    filterItineraries()
  }, [itineraries, searchTerm, statusFilter])

  const fetchItineraries = async () => {
    try {
      const response = await fetch('/api/itineraries')
      if (!response.ok) {
        throw new Error('获取行程列表失败')
      }
      const data = await response.json()
      setItineraries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filterItineraries = () => {
    let filtered = [...itineraries]

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(itinerary => 
        itinerary.name.toLowerCase().includes(term) ||
        itinerary.description.toLowerCase().includes(term)
      )
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(itinerary => {
        if (statusFilter === 'active') return itinerary.isActive
        if (statusFilter === 'inactive') return !itinerary.isActive
        return true
      })
    }

    setFilteredItineraries(filtered)
  }

  const getResourceCount = (itinerary: Itinerary) => {
    const guideCount = itinerary.activities.reduce((sum, activity) => 
      sum + activity.guides.length, 0
    )
    const vehicleCount = itinerary.activities.reduce((sum, activity) => 
      sum + activity.guides.filter(g => g.vehicleId).length, 0
    )
    return { guideCount, vehicleCount }
  }

  const handleCopyItinerary = async (itineraryId: string) => {
    setCopyingId(itineraryId)
    try {
      const response = await fetch(`/api/itineraries/${itineraryId}/copy`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('复制行程失败')
      }
      // 重新获取数据
      await fetchItineraries()
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制失败')
    } finally {
      setCopyingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              行程管理
            </h1>
            <p className="text-gray-600">
              管理所有行程模板
            </p>
          </div>
          <Link
            href="/itineraries/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            创建行程
          </Link>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 搜索框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <input
                type="text"
                placeholder="搜索行程名称、描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 状态筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部状态</option>
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>


          </div>
        </div>

        {/* 行程列表 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              行程列表 ({filteredItineraries.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行程名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    天数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItineraries.map((itinerary) => {
                  const { guideCount, vehicleCount } = getResourceCount(itinerary)
                  return (
                    <tr key={itinerary.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{itinerary.name}</div>
                        <div className="text-sm text-gray-500">{itinerary.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          itinerary.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {itinerary.isActive ? '启用' : '禁用'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {itinerary.durationDays} 天
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/itineraries/${itinerary.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            查看
                          </Link>
                          <Link
                            href={`/itineraries/${itinerary.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => handleCopyItinerary(itinerary.id)}
                            disabled={copyingId === itinerary.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            {copyingId === itinerary.id ? '复制中...' : '复制'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 
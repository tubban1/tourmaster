'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

interface Tour {
  id: string
  name: string
  status: string
  maxCapacity: number
  currentMembersCount: number
  overallArrivalTime?: string
  overallDepartureTime?: string
  itinerary: {
    id: string
    name: string
    durationDays: number
  }
}

export default function SchedulingPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours?status=planned,paid')
      if (!response.ok) {
        throw new Error('获取旅行团数据失败')
      }
      const data = await response.json()
      setTours(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return '已计划'
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center">
          <div className="text-lg">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              排班管理
            </h1>
            <p className="text-gray-600">
              为旅行团安排导游和车辆
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/tours"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              查看所有旅行团
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              返回仪表板
            </Link>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 旅行团列表 */}
          <div className="lg:col-span-2">
            {tours.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <div className="text-gray-500 text-lg mb-4">
                  暂无需要排班的旅行团
                </div>
                <Link
                  href="/tours"
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  查看所有旅行团
                </Link>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    需要排班的旅行团 ({tours.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          旅行团
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          行程
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          日期
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tours.map((tour) => (
                        <tr key={tour.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tour.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {tour.itinerary?.name || '未绑定行程'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tour.itinerary?.durationDays || 0} 天
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tour.status)}`}>
                              {getStatusText(tour.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tour.overallArrivalTime && tour.overallDepartureTime ? (
                              <div>
                                <div>{new Date(tour.overallArrivalTime).toLocaleDateString('zh-CN')}</div>
                                <div className="text-gray-500">至</div>
                                <div>{new Date(tour.overallDepartureTime).toLocaleDateString('zh-CN')}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">未设置</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/scheduling/${tour.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              开始排班
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 右侧统计信息 */}
          <div className="space-y-6">
            {/* 排班统计 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">排班统计</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总旅行团</span>
                  <span className="text-sm font-medium text-gray-900">{tours.length} 个</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已计划</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tours.filter(t => t.status === 'planned').length} 个
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">已付款</span>
                    <span className="text-sm font-medium text-gray-900">
                      {tours.filter(t => t.status === 'paid').length} 个
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 状态分布 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">状态分布</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已计划</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tours.filter(t => t.status === 'planned').length} 个
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已付款</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tours.filter(t => t.status === 'paid').length} 个
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">已完成</span>
                    <span className="text-sm font-medium text-gray-900">
                      {tours.filter(t => t.status === 'completed').length} 个
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 团员统计 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">团员统计</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总团员数</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tours.reduce((sum, t) => sum + t.currentMembersCount, 0)} 人
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总容量</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tours.reduce((sum, t) => sum + t.maxCapacity, 0)} 人
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">平均占用率</span>
                    <span className="text-sm font-medium text-gray-900">
                      {tours.length > 0 
                        ? Math.round((tours.reduce((sum, t) => sum + t.currentMembersCount, 0) / tours.reduce((sum, t) => sum + t.maxCapacity, 0)) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">排班提示</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 为旅行团安排导游</li>
                  <li>• 为旅行团安排车辆</li>
                  <li>• 确保资源不冲突</li>
                  <li>• 优化资源利用率</li>
                  <li>• 提高服务质量</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 
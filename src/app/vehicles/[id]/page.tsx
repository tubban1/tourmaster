'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import VehicleCalendar from '@/components/VehicleCalendar'

interface Vehicle {
  id: string
  plateNumber: string
  type: string
  make: string
  model: string
  capacity: number
  year: number
  occupations: {
    type: '使用' | '维修' | '保养' | '事故' | '出租' | '待命'
    dates: string[]
  }[]
  notes?: string
  isActive: boolean
  createdAt: string
  agency: {
    name: string
  }
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = params.id as string
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchVehicleDetails()
  }, [vehicleId])

  const fetchVehicleDetails = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`)
      if (!response.ok) {
        throw new Error('获取车辆信息失败')
      }
      const data = await response.json()
      setVehicle(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case '轿车':
        return 'bg-blue-100 text-blue-800'
      case '商务车':
        return 'bg-green-100 text-green-800'
      case '中巴':
        return 'bg-yellow-100 text-yellow-800'
      case '大巴':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOccupationTypeColor = (type: string) => {
    switch (type) {
      case '使用':
        return 'bg-red-100 text-red-700'
      case '维修':
        return 'bg-amber-100 text-amber-700'
      case '保养':
        return 'bg-emerald-100 text-emerald-700'
      case '事故':
        return 'bg-rose-100 text-rose-700'
      case '出租':
        return 'bg-violet-100 text-violet-700'
      case '待命':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 本地日期格式化函数（避免时区问题）
  const formatYMDLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 计算指定日期的状态（dates 模式）
  const getStatusForDate = (date: Date): string | undefined => {
    if (!vehicle?.occupations) return undefined
    const dateStr = formatYMDLocal(date)
    if (vehicle.occupations.some(occ => occ.type === '使用' && occ.dates?.includes(dateStr))) return '使用'
    const other = vehicle.occupations.find(occ => occ.type !== '待命' && occ.dates?.includes(dateStr))
    return other?.type
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

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">车辆不存在</div>
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
                车辆详情
              </h1>
              <p className="text-gray-600">
                {vehicle.plateNumber}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/vehicles"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回列表
              </Link>
              <Link
                href={`/vehicles/${vehicleId}/edit`}
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
            {/* 主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 车辆信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">车辆信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">车牌号码</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.plateNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">车辆类型</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVehicleTypeColor(vehicle.type)}`}>
                          {vehicle.type}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">品牌型号</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.make} {vehicle.model}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">载客容量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.capacity} 人</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">年份</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.year}</dd>
                    </div>
                    {/* 当前状态（按dates结构不再展示实时状态标签） */}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">注册时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(vehicle.createdAt).toLocaleDateString('zh-CN')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">所属旅行社</dt>
                      <dd className="mt-1 text-sm text-gray-900">{vehicle.agency?.name || '未知旅行社'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 状态历史（dates统计） */}
              {vehicle.occupations && vehicle.occupations.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">状态历史</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-3">
                      {vehicle.occupations.map((occupation, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOccupationTypeColor(occupation.type)}`}>
                                {occupation.type}
                              </span>
                            <span className="text-sm text-gray-600">{occupation.dates?.length ?? 0} 天</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 备注 */}
              {vehicle.notes && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">备注</h2>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-sm text-gray-700">{vehicle.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 快速操作 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    <Link
                      href={`/vehicles/${vehicleId}/edit`}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                    >
                      编辑车辆信息
                    </Link>
                  </div>
                </div>
              </div>

              {/* 占用日历（按新 dates 结构展示） */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">状态日历</h2>
                </div>
                <div className="px-6 py-4">
                  {/* 简化版日历渲染，复用车辆编辑页的色彩规范 */}
                  <VehicleCalendar vehicle={vehicle as any} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
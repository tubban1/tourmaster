'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

interface Vehicle {
  id: string
  plateNumber: string
  type: string
  make: string
  model: string
  capacity: number
  year: number
  occupations: {
    type: string
    startDate?: string
    endDate?: string
  }[]
  notes?: string
  isActive: boolean
  createdAt: string
  agency: {
    name: string
  }
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [capacityFilter, setCapacityFilter] = useState('all')

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, typeFilter, statusFilter, capacityFilter])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (!response.ok) {
        throw new Error('获取车辆列表失败')
      }
      const data = await response.json()
      setVehicles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = [...vehicles]

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(vehicle => 
        vehicle.plateNumber.toLowerCase().includes(term) ||
        vehicle.make.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        (vehicle.agency?.name || '').toLowerCase().includes(term)
      )
    }

    // 车辆类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === typeFilter)
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => {
        const currentOccupation = vehicle.occupations && vehicle.occupations.length > 0 ? vehicle.occupations[vehicle.occupations.length - 1] : null
        if (statusFilter === '使用') return currentOccupation?.type === '使用'
        if (statusFilter === '维修') return currentOccupation?.type === '维修'
        if (statusFilter === '保养') return currentOccupation?.type === '保养'
        if (statusFilter === '事故') return currentOccupation?.type === '事故'
        if (statusFilter === '待命') return currentOccupation?.type === '待命'
        if (statusFilter === '报废') return currentOccupation?.type === '报废'
        if (statusFilter === '租赁') return currentOccupation?.type === '租赁'
        if (statusFilter === '检测') return currentOccupation?.type === '检测'
        return true
      })
    }

    // 载客量过滤
    if (capacityFilter !== 'all') {
      filtered = filtered.filter(vehicle => {
        switch (capacityFilter) {
          case 'small':
            return vehicle.capacity <= 10
          case 'medium':
            return vehicle.capacity > 10 && vehicle.capacity <= 30
          case 'large':
            return vehicle.capacity > 30
          default:
            return true
        }
      })
    }

    setFilteredVehicles(filtered)
  }

  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case '大巴':
        return '大巴'
      case '中巴':
        return '中巴'
      case '轿车':
        return '轿车'
      case '商务车':
        return '商务车'
      default:
        return type
    }
  }

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case '大巴':
        return 'bg-blue-100 text-blue-800'
      case '中巴':
        return 'bg-green-100 text-green-800'
      case '轿车':
        return 'bg-purple-100 text-purple-800'
      case '商务车':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case '大巴':
        return '🚌'
      case '中巴':
        return '🚐'
      case '轿车':
        return '🚗'
      case '商务车':
        return '🚙'
      default:
        return '🚗'
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
              车辆管理
            </h1>
            <p className="text-gray-600">
              管理旅行社的车辆资源
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/vehicles/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              添加车辆
            </Link>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <input
                type="text"
                id="search"
                placeholder="车牌号、车辆型号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* 车辆类型筛选 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                车辆类型
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部类型</option>
                <option value="大巴">大巴</option>
                <option value="中巴">中巴</option>
                <option value="轿车">轿车</option>
                <option value="商务车">商务车</option>
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部状态</option>
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

            {/* 载客量筛选 */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                载客量
              </label>
              <select
                id="capacity"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部容量</option>
                <option value="small">小型 (≤10座)</option>
                <option value="medium">中型 (11-30座)</option>
                <option value="large">大型 ({'>'}30座)</option>
              </select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>共找到 {filteredVehicles.length} 辆车</span>
              <div className="flex space-x-4">
                <span>总车辆: {vehicles.length}</span>
                <span>使用: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '使用').length}</span>
                <span>维修: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '维修').length}</span>
                <span>保养: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '保养').length}</span>
                <span>事故: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '事故').length}</span>
                <span>待命: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '待命').length}</span>
                <span>报废: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '报废').length}</span>
                <span>租赁: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '租赁').length}</span>
                <span>检测: {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '检测').length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 车辆列表和统计信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 车辆列表 */}
          <div className="lg:col-span-2">
            {filteredVehicles.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <div className="text-gray-500 text-lg mb-4">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || capacityFilter !== 'all'
                    ? '没有找到符合条件的车辆' 
                    : '暂无车辆信息'
                  }
                </div>
                {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && capacityFilter === 'all' && (
                  <Link
                    href="/vehicles/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    添加第一辆车
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-lg">
                              {getVehicleIcon(vehicle.type)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {vehicle.plateNumber}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVehicleTypeColor(vehicle.type)}`}>
                                {getVehicleTypeText(vehicle.type)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                {vehicle.capacity} 座
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vehicle.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.isActive ? '可用' : '维护中'}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">车辆信息:</span>
                          <div className="mt-1">
                            <div>{vehicle.make} {vehicle.model}</div>
                            <div>年份: {vehicle.year}</div>
                            <div>状态: {vehicle.occupations && vehicle.occupations.length > 0 ? vehicle.occupations[vehicle.occupations.length - 1].type : '使用'}</div>
                            {vehicle.occupations && vehicle.occupations.length > 0 && vehicle.occupations[vehicle.occupations.length - 1].startDate && vehicle.occupations[vehicle.occupations.length - 1].endDate && vehicle.occupations[vehicle.occupations.length - 1].type !== '使用' && (
                              <div>当前状态期间: {new Date(vehicle.occupations[vehicle.occupations.length - 1].startDate!).toLocaleDateString('zh-CN')} - {new Date(vehicle.occupations[vehicle.occupations.length - 1].endDate!).toLocaleDateString('zh-CN')}</div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">所属旅行社:</span>
                          <span className="ml-2">{vehicle.agency?.name || '未知旅行社'}</span>
                        </div>
                        
                        {vehicle.notes && (
                          <div>
                            <span className="font-medium">备注:</span>
                            <div className="mt-1 text-gray-500">{vehicle.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/vehicles/${vehicle.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          查看详情
                        </Link>
                        <Link
                          href={`/vehicles/${vehicle.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          编辑
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧统计信息 */}
          <div className="space-y-6">
            {/* 快速操作 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <Link
                  href="/vehicles/new"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                >
                  添加车辆
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                >
                  返回仪表板
                </Link>
              </div>
            </div>

            {/* 车辆统计 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">车辆统计</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总车辆数</span>
                  <span className="text-sm font-medium text-gray-900">{vehicles.length} 辆</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">可用车辆</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.isActive).length} 辆
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">维护中车辆</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => !v.isActive).length} 辆
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">可用率</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicles.length > 0 
                        ? Math.round((vehicles.filter(v => v.isActive).length / vehicles.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 车辆类型分布 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">车辆类型分布</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">大巴</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.type === '大巴').length} 辆
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">中巴</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.type === '中巴').length} 辆
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">轿车</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.type === '轿车').length} 辆
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">商务车</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicles.filter(v => v.type === '商务车').length} 辆
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 载客量分布 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">载客量分布</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">小型 (≤10座)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.capacity <= 10).length} 辆
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">中型 (11-30座)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.capacity > 10 && v.capacity <= 30).length} 辆
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">大型 (&gt;30座)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicles.filter(v => v.capacity > 30).length} 辆
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
                  <span className="text-sm text-gray-600">使用中</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '使用').length} 辆
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">维修中</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '维修').length} 辆
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">保养中</span>
                  <span className="text-sm font-medium text-gray-900">
                    {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '保养').length} 辆
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">待命中</span>
                    <span className="text-sm font-medium text-gray-900">
                      {vehicles.filter(v => v.occupations && v.occupations.length > 0 && v.occupations[v.occupations.length - 1].type === '待命').length} 辆
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">管理提示</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 可添加新车辆</li>
                  <li>• 支持多类型筛选</li>
                  <li>• 支持状态筛选</li>
                  <li>• 支持载客量筛选</li>
                  <li>• 可查看车辆详细信息</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 
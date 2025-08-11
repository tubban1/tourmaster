'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

interface Supplier {
  id: string
  name: string
  type: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: string
  services: string[]
  rating: number
  isActive: boolean
  createdAt: string
  agency: {
    name: string
  }
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    filterSuppliers()
  }, [suppliers, searchTerm, typeFilter, ratingFilter, statusFilter])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (!response.ok) {
        throw new Error('获取供应商列表失败')
      }
      const data = await response.json()
      setSuppliers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filterSuppliers = () => {
    let filtered = [...suppliers]

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(term) ||
        supplier.contactPerson.toLowerCase().includes(term) ||
        supplier.contactPhone.toLowerCase().includes(term) ||
        supplier.contactEmail.toLowerCase().includes(term) ||
        supplier.address.toLowerCase().includes(term) ||
        supplier.services.some(service => service.toLowerCase().includes(term))
      )
    }

    // 类型过滤
    if (typeFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.type === typeFilter)
    }

    // 评分过滤
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(supplier => {
        if (ratingFilter === 'excellent') return supplier.rating >= 4.5
        if (ratingFilter === 'good') return supplier.rating >= 4.0 && supplier.rating < 4.5
        if (ratingFilter === 'average') return supplier.rating >= 3.0 && supplier.rating < 4.0
        if (ratingFilter === 'poor') return supplier.rating < 3.0
        return true
      })
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => {
        if (statusFilter === 'active') return supplier.isActive
        if (statusFilter === 'inactive') return !supplier.isActive
        return true
      })
    }

    setFilteredSuppliers(filtered)
  }

  const getSupplierTypeText = (type: string) => {
    switch (type) {
      case 'hotel':
        return '酒店'
      case 'restaurant':
        return '餐厅'
      case 'transport':
        return '交通'
      case 'attraction':
        return '景点'
      case 'guide':
        return '导游'
      case 'insurance':
        return '保险'
      case 'other':
        return '其他'
      default:
        return type
    }
  }

  const getSupplierTypeColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-800'
      case 'restaurant':
        return 'bg-green-100 text-green-800'
      case 'transport':
        return 'bg-purple-100 text-purple-800'
      case 'attraction':
        return 'bg-yellow-100 text-yellow-800'
      case 'guide':
        return 'bg-indigo-100 text-indigo-800'
      case 'insurance':
        return 'bg-red-100 text-red-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>)
    }

    return stars
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
              供应商管理
            </h1>
            <p className="text-gray-600">
              管理旅行社的供应商资源
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/suppliers/new"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              添加供应商
            </Link>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 搜索框 */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <input
                type="text"
                id="search"
                placeholder="供应商名称、联系人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* 供应商类型筛选 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                供应商类型
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部类型</option>
                <option value="hotel">酒店</option>
                <option value="restaurant">餐厅</option>
                <option value="transport">交通</option>
                <option value="attraction">景点</option>
                <option value="guide">导游</option>
                <option value="insurance">保险</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* 评分筛选 */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                评分
              </label>
              <select
                id="rating"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部评分</option>
                <option value="excellent">优秀 (4.5+)</option>
                <option value="good">良好 (4.0-4.4)</option>
                <option value="average">一般 (3.0-3.9)</option>
                <option value="poor">较差 (&lt;3.0)</option>
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
                <option value="active">活跃</option>
                <option value="inactive">非活跃</option>
              </select>
            </div>

            {/* 统计信息 */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                共找到 <span className="font-medium text-gray-900">{filteredSuppliers.length}</span> 个供应商
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 供应商列表 */}
          <div className="lg:col-span-2">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-12 bg-white shadow rounded-lg">
                <div className="text-gray-500 text-lg mb-4">
                  {searchTerm || typeFilter !== 'all' || ratingFilter !== 'all' || statusFilter !== 'all'
                    ? '没有找到符合条件的供应商'
                    : '暂无供应商信息'
                  }
                </div>
                {!searchTerm && typeFilter === 'all' && ratingFilter === 'all' && statusFilter === 'all' && (
                  <Link
                    href="/suppliers/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    添加第一个供应商
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-lg">
                              🏢
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {supplier.name}
                            </h3>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSupplierTypeColor(supplier.type)}`}>
                                {getSupplierTypeText(supplier.type)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500">
                                {supplier.services.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            supplier.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {supplier.isActive ? '活跃' : '非活跃'}
                          </span>
                          <div className="flex items-center">
                            {renderStars(supplier.rating)}
                            <span className={`ml-2 text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                              {supplier.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">联系人:</span>
                          <div className="mt-1">
                            <div>{supplier.contactPerson}</div>
                            <div>{supplier.contactPhone}</div>
                            <div>{supplier.contactEmail}</div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">地址:</span>
                          <div className="mt-1">{supplier.address}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/suppliers/${supplier.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          查看详情
                        </Link>
                        <Link
                          href={`/suppliers/${supplier.id}/edit`}
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
                  href="/suppliers/new"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                >
                  添加供应商
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                >
                  返回仪表板
                </Link>
              </div>
            </div>

            {/* 供应商统计 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">供应商统计</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总供应商数</span>
                  <span className="text-sm font-medium text-gray-900">{suppliers.length} 个</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">活跃供应商</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suppliers.filter(s => s.isActive).length} 个
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">非活跃供应商</span>
                    <span className="text-sm font-medium text-gray-900">
                      {suppliers.filter(s => !s.isActive).length} 个
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 类型分布 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">类型分布</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">酒店</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suppliers.filter(s => s.type === 'hotel').length} 个
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">餐厅</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suppliers.filter(s => s.type === 'restaurant').length} 个
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">交通</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suppliers.filter(s => s.type === 'transport').length} 个
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">景点</span>
                    <span className="text-sm font-medium text-gray-900">
                      {suppliers.filter(s => s.type === 'attraction').length} 个
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 评分分布 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">评分分布</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">优秀 (4.5+)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suppliers.filter(s => s.rating >= 4.5).length} 个
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">良好 (4.0-4.4)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {suppliers.filter(s => s.rating >= 4.0 && s.rating < 4.5).length} 个
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">一般 (3.0-3.9)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {suppliers.filter(s => s.rating >= 3.0 && s.rating < 4.0).length} 个
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
                  <li>• 可添加新供应商</li>
                  <li>• 支持多类型筛选</li>
                  <li>• 支持评分筛选</li>
                  <li>• 支持状态筛选</li>
                  <li>• 可查看供应商详细信息</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 
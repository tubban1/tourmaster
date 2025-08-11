'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Vehicle {
  id: string
  agencyId: string
  plateNumber: string
  type: string
  make: string
  model: string
  capacity: number
  year: number
  occupations: VehicleOccupation[]
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface VehicleOccupation {
  type: '使用' | '维修' | '保养' | '事故' | '待命' | '出租'
  dates: string[] // 改为日期数组，格式：YYYY-MM-DD
}

export default function VehicleEditPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<VehicleOccupation['type']>('待命')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [formData, setFormData] = useState({
    plateNumber: '',
    type: '',
    make: '',
    model: '',
    capacity: 1,
    year: new Date().getFullYear(),
    notes: '',
    isActive: true
  })

  useEffect(() => {
    if (id) {
      fetchVehicleData()
    }
  }, [id])

  const fetchVehicleData = async () => {
    try {
      const response = await fetch(`/api/vehicles/${id}`)
      if (response.ok) {
      const data = await response.json()
        // 规范化 occupations，确保每项都有 dates 数组
        const normalizedOccupations = Array.isArray(data.occupations)
          ? data.occupations.map((occ: any) => ({
              type: occ?.type ?? '待命',
              dates: Array.isArray(occ?.dates) ? occ.dates : []
            }))
          : []

        setVehicle({ ...data, occupations: normalizedOccupations })
      setFormData({
        plateNumber: data.plateNumber,
        type: data.type,
        make: data.make,
        model: data.model,
        capacity: data.capacity,
        year: data.year,
        notes: data.notes || '',
        isActive: data.isActive
      })
      } else {
        setError('获取车辆信息失败')
      }
    } catch (error) {
      console.error('获取车辆信息失败:', error)
      setError('获取车辆信息失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'capacity' || field === 'year' ? Number(value) : value
    }))
  }

  // 生成日历数据
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  // 本地日期格式化函数（避免时区问题）
  const formatYMDLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 获取日期在车辆占用中的状态
  const getDateStatus = (date: Date) => {
    const dateStr = formatYMDLocal(date)
    const occupation = vehicle?.occupations?.find(occ => Array.isArray(occ.dates) && occ.dates.includes(dateStr))
    return occupation?.type || null
  }

  // 根据状态返回颜色样式（背景/文字/小圆点）
  const getStatusStyles = (status: string | null) => {
    switch (status) {
      case '维修':
        return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' }
      case '保养':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
      case '事故':
        return { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' }
      case '出租':
        return { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' }
      // 待命不写入，不特别标色
      default:
        return { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' }
    }
  }

  // 检查日期是否被使用（不可修改）
  const isDateUsed = (date: Date) => {
    const dateStr = formatYMDLocal(date)
    const occupation = vehicle?.occupations?.find(occ => occ.type === '使用' && Array.isArray(occ.dates) && occ.dates.includes(dateStr))
    return !!occupation
  }

  // 选择日期
  const toggleDateSelection = (date: Date) => {
    if (isDateUsed(date)) return // 使用中的日期不可选择
    
    const dateStr = formatYMDLocal(date)
    setSelectedDates(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    )
  }

  // 应用状态到选中的日期
  const applyStatusToDates = () => {
    if (!vehicle || selectedDates.length === 0) return

    const newOccupations = [...(vehicle.occupations || [])]
    
    // 移除选中日期在其他状态中的记录
    newOccupations.forEach(occ => {
      const currentDates = Array.isArray(occ.dates) ? occ.dates : []
      occ.dates = currentDates.filter(date => !selectedDates.includes(date))
    })
    
    // 移除空的状态记录
    const filteredOccupations = newOccupations.filter(occ => (occ.dates?.length ?? 0) > 0)
    
    // 选择“待命”时，仅清除所选日期，不写入新记录；
    // 其他非“使用”的状态则写入记录
    if (selectedStatus && selectedStatus !== '使用' && selectedStatus !== '待命') {
      filteredOccupations.push({
        type: selectedStatus,
        dates: selectedDates
      })
    }
    
    setVehicle(prev => prev ? { ...prev, occupations: filteredOccupations } : null)
    setSelectedDates([])
  }

  // 移除状态
  const removeStatus = (type: VehicleOccupation['type'], date: string) => {
    if (!vehicle) return
    
    const newOccupations = (vehicle.occupations || []).map(occ => 
      occ.type === type 
        ? { ...occ, dates: (Array.isArray(occ.dates) ? occ.dates : []).filter(d => d !== date) }
        : occ
    ).filter(occ => (occ.dates?.length ?? 0) > 0)
    
    setVehicle(prev => prev ? { ...prev, occupations: newOccupations } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          occupations: vehicle?.occupations || []
        })
      })

      if (response.ok) {
        router.push(`/vehicles/${id}`)
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

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() - 1)
      return newMonth
    })
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + 1)
      return newMonth
    })
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

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-500 mb-4">{error || '车辆不存在'}</p>
          <Link
            href="/vehicles"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            返回车辆列表
          </Link>
        </div>
      </div>
    )
  }

  const calendarDays = generateCalendarDays()
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">编辑车辆</h1>
              <p className="text-sm text-gray-500 mt-1">修改车辆信息和状态安排</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/vehicles/${id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </Link>
              <button
                type="submit"
                form="vehicle-form"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex gap-6">
            {/* 左侧：车辆信息表单 */}
            <div className="flex-1 space-y-6">
              <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-6">
                {/* 基本信息 */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                        <label className="block text-sm font-medium text-gray-700">
                      车牌号 *
                    </label>
                    <input
                      type="text"
                          required
                      value={formData.plateNumber}
                          onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700">
                      车辆类型 *
                    </label>
                    <select
                          required
                      value={formData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                          <option value="">请选择类型</option>
                          <option value="大巴">大巴</option>
                          <option value="中巴">中巴</option>
                          <option value="小巴">小巴</option>
                      <option value="轿车">轿车</option>
                          <option value="SUV">SUV</option>
                    </select>
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700">
                      品牌 *
                    </label>
                    <input
                      type="text"
                          required
                      value={formData.make}
                          onChange={(e) => handleInputChange('make', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700">
                      型号 *
                    </label>
                    <input
                      type="text"
                          required
                      value={formData.model}
                          onChange={(e) => handleInputChange('model', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700">
                          载客数 *
                    </label>
                    <input
                      type="number"
                          required
                      min="1"
                      value={formData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700">
                      年份 *
                    </label>
                    <input
                      type="number"
                          required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          备注
                        </label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                </div>

                    <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">启用车辆</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
                          </div>
                          
            {/* 右侧：车辆状态日历 */}
            <div className="w-96 space-y-6">
              {/* 状态管理（去掉当前状态栏，仅保留状态选择与应用） */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">状态管理</h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择状态
                              </label>
                              <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as VehicleOccupation['type'])}
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                      {/* 选择“待命”表示清除所选日期的状态（不写入记录） */}
                      <option value="待命">待命</option>
                                <option value="维修">维修</option>
                                <option value="保养">保养</option>
                                <option value="事故">事故</option>
                      <option value="出租">出租</option>
                                <option value="检测">检测</option>
                              </select>
                            </div>

                  {selectedDates.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        已选择 {selectedDates.length} 天
                      </p>
                      <button
                        type="button"
                        onClick={applyStatusToDates}
                        className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        应用状态
                      </button>
                    </div>
                  )}

                  {/* 当前状态栏已移除 */}
                </div>
              </div>

              {/* 车辆状态日历 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">状态日历</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={goToPreviousMonth}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={goToNextMonth}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentMonth.getFullYear()}年 {monthNames[currentMonth.getMonth()]}
                  </p>
                </div>
                <div className="px-6 py-4">
                  {/* 星期标题 */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* 日历网格 */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                      const dateStr = formatYMDLocal(date)
                      const status = getDateStatus(date)
                      const isUsed = isDateUsed(date)
                      const isSelected = selectedDates.includes(dateStr)
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                      const statusStyles = getStatusStyles(status)

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDateSelection(date)}
                          disabled={isUsed}
                          className={`
                            relative p-2 text-xs rounded-md transition-colors
                            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                            ${isSelected ? 'bg-indigo-500 text-white' : ''}
                            ${!isSelected && isUsed ? 'bg-red-100 text-red-600 cursor-not-allowed' : ''}
                            ${!isSelected && !isUsed && status ? `${statusStyles.bg} ${statusStyles.text}` : ''}
                            ${!status && !isUsed && isCurrentMonth && !isSelected ? 'hover:bg-gray-100' : ''}
                          `}
                        >
                          {date.getDate()}
                          {status && !isSelected && !isUsed && (
                            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${statusStyles.dot}`}></div>
                          )}
                        </button>
                      )
                    })}
                </div>

                  {/* 图例 */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-100 rounded"></div>
                        <span className="text-gray-600">使用</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-amber-100 rounded"></div>
                        <span className="text-gray-600">维修</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                        <span className="text-gray-600">保养</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-rose-100 rounded"></div>
                        <span className="text-gray-600">事故</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-violet-100 rounded"></div>
                        <span className="text-gray-600">出租</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                        <span className="text-gray-600">已选择</span>
                </div>
              </div>
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
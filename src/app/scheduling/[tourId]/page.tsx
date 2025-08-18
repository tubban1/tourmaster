'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import VehicleCalendar from '@/components/VehicleCalendar'
import GuideCalendar from '@/components/GuideCalendar'

interface Conflict {
  type: 'guide' | 'vehicle'
  id: string
  name: string
  date: string
  message: string
}

interface DaySchedule {
  day: number
  date?: string // 具体日期 (YYYY-MM-DD)
  description: string
  hotelInfo?: {
    hotelName: string
    checkInTime: string
    checkOutTime: string
    notes: string
  }
  guides: GuideAssignment[]
}

interface GuideAssignment {
  guideId: string
  vehicleId: string
  guideAccommodation: string // 简化为单一酒店名称字符串
  notes: string // 导游备注
}

interface Tour {
  id: string
  name: string
  status: string
  maxCapacity: number
  currentMembersCount: number
  agencyId: string
  itineraryId?: string
  overallArrivalTime?: string // 整个团的抵达时间
  overallDepartureTime?: string // 整个团的送机时间
  itinerary?: {
    id: string
    name: string
    durationDays: number
    activities: DaySchedule[]
  }
  salesManager?: {
    id: string
    username: string
  }
}

interface TourGuide {
  id: string
  name: string
  contactPhone: string
  email: string
  languages: string[]
  specialties: string[]
  rating: number
  occupiedDates: any[]
  isActive: boolean
}

interface Vehicle {
  id: string
  plateNumber: string
  type: string
  make: string
  model: string
  capacity: number
  year: number
  occupations: any[]
  isActive: boolean
}

export default function TourSchedulingPage() {
  const params = useParams()
  const router = useRouter()
  const tourId = params.tourId as string
  
  const [tour, setTour] = useState<Tour | null>(null)
  const [guides, setGuides] = useState<TourGuide[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState<DaySchedule[]>([])
  const [conflicts, setConflicts] = useState<Conflict[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showFullCalendar, setShowFullCalendar] = useState<{ type: 'guide' | 'vehicle', id: string } | null>(null)

  // 本地日期格式化函数（避免时区问题）
  const formatYMDLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 旅行日期判断
  const isTravelDate = (isoDate?: string) => {
    if (!tour?.overallArrivalTime || !tour?.overallDepartureTime || !isoDate) return false
    const d = new Date(isoDate)
    const start = new Date(tour.overallArrivalTime)
    const end = new Date(tour.overallDepartureTime)
    
    // 只比较日期部分，忽略时间
    const dateOnly = isoDate
    const startDateOnly = tour.overallArrivalTime.split('T')[0]
    const endDateOnly = tour.overallDepartureTime.split('T')[0]
    
    return dateOnly >= startDateOnly && dateOnly <= endDateOnly
  }



  // 检查认证状态
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        // 未认证，立即重定向到登录页面
        router.replace('/')
        return
      }
      setAuthChecked(true)
    } catch (error) {
      console.error('认证检查失败:', error)
      // 认证检查失败，立即重定向到登录页面
      router.replace('/')
      return
    }
  }

  const fetchTourData = async () => {
    try {
      const response = await fetch(`/api/tours/${tourId}`)
      if (response.ok) {
        const data = await response.json()
        setTour(data)
        
                            // 根据overallArrivalTime和overallDepartureTime生成每一天的排班
                    if (data.overallArrivalTime && data.overallDepartureTime) {
                      const startDate = new Date(data.overallArrivalTime)
                      const endDate = new Date(data.overallDepartureTime)
                      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

                      // 生成每一天的排班数据
                      const dailySchedules: DaySchedule[] = []
                      for (let i = 0; i < durationDays; i++) {
                        const currentDate = new Date(startDate)
                        currentDate.setDate(startDate.getDate() + i)

                        // 如果有itinerary信息，使用它；否则生成默认信息
                        const itineraryDay = data.itinerary?.activities?.[i]
                        
                        dailySchedules.push({
                          day: i + 1,
                          date: formatYMDLocal(currentDate), // 格式化为 YYYY-MM-DD
                          description: itineraryDay?.description || `第${i + 1}天行程`,
                          hotelInfo: itineraryDay?.hotelInfo || {
                            hotelName: '',
                            checkInTime: '',
                            checkOutTime: '',
                            notes: ''
                          },
                          guides: itineraryDay?.guides || []
                        })
                      }
                      setSchedule(dailySchedules)
                    } else {
                      // 如果没有日期信息，使用当前日期作为默认值，生成7天的排班
                      const startDate = new Date()
                      const dailySchedules: DaySchedule[] = []
                      for (let i = 0; i < 7; i++) {
                        const currentDate = new Date(startDate)
                        currentDate.setDate(startDate.getDate() + i)
                        dailySchedules.push({
                          day: i + 1,
                          date: formatYMDLocal(currentDate),
                          description: `第${i + 1}天行程`,
                          hotelInfo: {
                            hotelName: '',
                            checkInTime: '',
                            checkOutTime: '',
                            notes: ''
                          },
                          guides: []
                        })
                      }
                      setSchedule(dailySchedules)
                    }
      } else {
        throw new Error('获取旅行团数据失败')
      }
    } catch (err) {
      console.error('获取旅行团数据失败:', err)
      setError('获取旅行团数据失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/guides')
      if (response.ok) {
        const data = await response.json()
        setGuides(data.filter((guide: TourGuide) => guide.isActive))
      }
    } catch (error) {
      console.error('获取导游列表失败:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        const activeVehicles = data.filter((vehicle: Vehicle) => vehicle.isActive)
        console.log('获取到的最新车辆数据:', activeVehicles.map((v: Vehicle) => ({
          id: v.id,
          plateNumber: v.plateNumber,
          occupations: v.occupations
        })))
        setVehicles(activeVehicles)
      }
    } catch (error) {
      console.error('获取车辆列表失败:', error)
    }
  }

  useEffect(() => {
    if (authChecked) {
      fetchTourData()
      fetchGuides()
      fetchVehicles()
    }
  }, [tourId, authChecked])

  // 如果还没有完成认证检查，显示加载状态
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">检查认证状态...</div>
      </div>
    )
  }

  // 如果认证检查完成但还在加载数据，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  const updateGuideAssignment = (dayIndex: number, guideIndex: number, field: string, value: string) => {
    const newSchedule = [...schedule]
    if (!newSchedule[dayIndex].guides[guideIndex]) {
              newSchedule[dayIndex].guides[guideIndex] = { guideId: '', vehicleId: '', guideAccommodation: '', notes: '' }
    }
    
    if (field === 'guideId') {
      newSchedule[dayIndex].guides[guideIndex].guideId = value
    } else if (field === 'vehicleId') {
      newSchedule[dayIndex].guides[guideIndex].vehicleId = value
      // 车辆更换后，自动保存以更新占用状态
      setTimeout(() => autoSaveSchedule(newSchedule), 500)
    } else if (field === 'guideAccommodation') {
        newSchedule[dayIndex].guides[guideIndex].guideAccommodation = value
    } else if (field === 'notes') {
      newSchedule[dayIndex].guides[guideIndex].notes = value
    }
    
    setSchedule(newSchedule)
  }

  const addGuideToDay = (dayIndex: number) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].guides.push({
      guideId: '',
      vehicleId: '',
              guideAccommodation: '',
      notes: ''
    })
    setSchedule(newSchedule)
  }

  const removeGuideFromDay = (dayIndex: number, guideIndex: number) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].guides.splice(guideIndex, 1)
    setSchedule(newSchedule)
  }

  // 自动保存排班（用于车辆更换后的状态更新）
  const autoSaveSchedule = async (scheduleToSave: any[]) => {
    if (!tour?.itinerary?.id) return
    
    try {
      const response = await fetch(`/api/tours/${tourId}/scheduling`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities: scheduleToSave }),
      })

      if (response.ok) {
        // 静默保存成功，不显示提示
        
        // 自动保存成功后，重新获取车辆数据以更新可用性显示
        await fetchVehicles()
      }
    } catch (error) {
      console.error('自动保存失败:', error)
      // 自动保存失败不影响用户体验
    }
  }

  const saveSchedule = async () => {
    if (!tour?.itinerary?.id) return
    
    // 保存前强制可用性校验
    try {
      setCheckingAvailability(true)
      // 直接使用 YYYY-MM-DD 字符串，避免时区偏移到后端
      const dates = schedule.map(d => d.date || '')
      const vehicleIds = schedule.flatMap(day => day.guides.map(g => g.vehicleId).filter(Boolean) as string[])
      const resp = await fetch('/api/scheduling/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: tour.id, dates, vehicleIds })
      })
      if (resp.ok) {
        const result = await resp.json()
        setConflicts(result.conflicts || [])
        if (result.conflicts && result.conflicts.length > 0) {
          alert('存在车辆占用冲突，请先处理标红日期再保存。')
          setCheckingAvailability(false)
          return
        }
      }
    } catch (e) {
      // 忽略可用性接口错误，继续保存
    } finally {
      setCheckingAvailability(false)
    }
    
    setSaving(true)
    try {
      const response = await fetch(`/api/tours/${tourId}/scheduling`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities: schedule }),
      })

      if (!response.ok) {
        throw new Error('保存排班失败')
      }

      alert('排班信息保存成功！')
      
      // 保存成功后，重新获取车辆数据以更新可用性显示
      await fetchVehicles()
      
    } catch (error) {
      console.error('保存排班失败:', error)
      alert('保存排班失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 检查导游和车辆可用性
  const checkAvailability = async () => {
    if (!schedule.length || !tour) return
    
    setCheckingAvailability(true)
    try {
      const dates = schedule.map(day => {
        // 使用schedule中的具体日期
        return day.date ? new Date(day.date).toISOString() : new Date().toISOString()
      })
      
      const guideIds = schedule.flatMap(day => 
        day.guides.map(g => g.guideId).filter(id => id)
      )
      
      const vehicleIds = schedule.flatMap(day => 
        day.guides.map(g => g.vehicleId).filter(id => id)
      )
      
      const response = await fetch('/api/scheduling/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: tour.id,
          dates,
          guideIds,
          vehicleIds
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setConflicts(result.conflicts || [])
      }
    } catch (error) {
      console.error('检查可用性失败:', error)
    } finally {
      setCheckingAvailability(false)
    }
  }

  // 复制第一天的排班到所有天
  const copyToAllDays = () => {
    const firstDay = schedule[0]
    if (!firstDay || firstDay.guides.length === 0) return

                    // 根据overallArrivalTime计算每一天的日期
                const startDate = tour?.overallArrivalTime ? new Date(tour.overallArrivalTime) : new Date()

    const newSchedule = schedule.map((day, index) => {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + index)

      return {
        ...day,
        date: formatYMDLocal(currentDate),
        guides: firstDay.guides.map(guide => ({
          ...guide
        }))
      }
    })

    setSchedule(newSchedule)
  }

  // 清空所有排班
  const clearAllSchedule = () => {
    if (confirm('确定要清空所有排班信息吗？')) {
                        // 根据overallArrivalTime重新计算每一天的日期
                  const startDate = tour?.overallArrivalTime ? new Date(tour.overallArrivalTime) : new Date()

      const newSchedule = schedule.map((day, index) => {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + index)

        return {
          ...day,
          date: formatYMDLocal(currentDate),
          guides: []
        }
      })

      setSchedule(newSchedule)
    }
  }

  if (error && !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">旅行团不存在</div>
      </div>
    )
  }

  const generateDateRange = () => {
    if (!tour?.overallArrivalTime || !tour?.overallDepartureTime) {
      // 如果没有旅行日期，返回空数组
      return []
    }

    // 只返回旅行团的实际日期范围
    const startDate = new Date(tour.overallArrivalTime)
    const endDate = new Date(tour.overallDepartureTime)
    
    const dates: string[] = []
    let currentDate = new Date(startDate)
    
    // 使用时间戳比较，避免日期对象比较的问题
    const endTimestamp = endDate.getTime()
    
    while (currentDate.getTime() <= endTimestamp) {
      dates.push(formatYMDLocal(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  // 添加3D翻转效果的CSS样式
  const flipStyles = `
    .perspective-1000 {
      perspective: 1000px;
    }
    .transform-style-preserve-3d {
      transform-style: preserve-3d;
    }
    .backface-hidden {
      backface-visibility: hidden;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
  `

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: flipStyles }} />
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tour.name}
              </p>
              {tour.overallArrivalTime && tour.overallDepartureTime && (
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(tour.overallArrivalTime).toLocaleDateString('zh-CN')} 至 {new Date(tour.overallDepartureTime).toLocaleDateString('zh-CN')}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex gap-6">
            {/* 主要内容区域 */}
            <div className="flex-1 space-y-6">
              {/* 旅行团信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">旅行团信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">旅行团名称</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tour.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">销售经理</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tour.salesManager?.username || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">容量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{tour.currentMembersCount}/{tour.maxCapacity} 人</dd>
                    </div>
                    {tour.itinerary && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">绑定行程</dt>
                        <dd className="mt-1 text-sm text-gray-900">{tour.itinerary.name} ({tour.itinerary.durationDays}天)</dd>
                      </div>
                    )}
                    {tour.overallArrivalTime && tour.overallDepartureTime && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">旅行日期</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(tour.overallArrivalTime).toLocaleDateString('zh-CN')} 至 {new Date(tour.overallDepartureTime).toLocaleDateString('zh-CN')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>



              {/* 每日排班表格 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">每日排班安排</h2>
                    {tour?.overallArrivalTime && tour?.overallDepartureTime && (
                      <p className="text-sm text-gray-600 mt-1">
                        旅行日期：{new Date(tour.overallArrivalTime).toLocaleDateString('zh-CN')} 至 {new Date(tour.overallDepartureTime).toLocaleDateString('zh-CN')}
                      </p>
                    )}
                  </div>
                  {tour.itinerary && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={copyToAllDays}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        复制第一天排班
                      </button>
                      <button
                        onClick={clearAllSchedule}
                        className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        清空排班
                      </button>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4">
                  {tour.itinerary ? (
                    <div className="space-y-6">
                      {schedule.map((daySchedule, dayIndex) => (
                        <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                第 {daySchedule.day} 天
                              </h3>
                              {daySchedule.date && (
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                  <p>
                                    {new Date(daySchedule.date).toLocaleDateString('zh-CN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(daySchedule.date).toLocaleDateString('zh-CN', {
                                      weekday: 'long'
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => addGuideToDay(dayIndex)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              添加导游
                            </button>
                          </div>

                          {/* 导游安排 */}
                          <div className="space-y-3">
                            {daySchedule.guides.map((guide, guideIndex) => (
                              <div key={guideIndex} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-semibold text-gray-800">导游 {guideIndex + 1}</span>
                                  </div>
                                  <button
                                    onClick={() => removeGuideFromDay(dayIndex, guideIndex)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors text-sm"
                                  >
                                    删除
                                  </button>
                                </div>
                                
                                <div className="space-y-4">
                                  {/* 第一行：导游、车辆、住宿选择 */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* 导游选择 */}
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-gray-700">
                                      选择导游
                                    </label>
                                    <select
                                      value={guide.guideId}
                                      onChange={(e) => updateGuideAssignment(dayIndex, guideIndex, 'guideId', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
                                    >
                                      <option value="">请选择导游</option>
                                      {guides.map(g => (
                                        <option key={g.id} value={g.id}>
                                          {g.name} - {g.languages.join(', ')} ({g.rating}星)
                                        </option>
                                      ))}
                                    </select>
                                      

                                  </div>

                                  {/* 车辆选择 */}
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-gray-700">
                                      选择车辆
                                    </label>
                                      <div className="relative">
                                    <select
                                      value={guide.vehicleId || ''}
                                      onChange={(e) => updateGuideAssignment(dayIndex, guideIndex, 'vehicleId', e.target.value)}
                                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
                                    >
                                      <option value="">请选择车辆</option>
                                      {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                          {v.make} {v.model} - {v.plateNumber} ({v.capacity}人)
                                        </option>
                                      ))}
                                    </select>
                                      </div>
                                      

                                  </div>

                                  {/* 住宿安排 */}
                                    <div className="space-y-2">
                                      <label className="block text-sm font-medium text-gray-700">
                                      导游住宿
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="酒店名称"
                                        value={guide.guideAccommodation || ''}
                                        onChange={(e) => updateGuideAssignment(dayIndex, guideIndex, 'guideAccommodation', e.target.value)}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2"
                                    />
                                  </div>
                                  </div>

                                  {/* 第二行：导游备注 */}
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      导游备注
                                    </label>
                                    <textarea
                                      placeholder="导游备注信息"
                                      value={guide.notes || ''}
                                      onChange={(e) => updateGuideAssignment(dayIndex, guideIndex, 'notes', e.target.value)}
                                      rows={2}
                                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      该旅行团尚未绑定行程，无法进行排班
                    </div>
                  )}
                </div>
              </div>
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
                    href="/scheduling"
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                  >
                    返回列表
                  </Link>
                  <button
                    onClick={checkAvailability}
                    disabled={checkingAvailability}
                    className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-center block disabled:opacity-50"
                  >
                    {checkingAvailability ? '检查中...' : '检查冲突'}
                  </button>
                  <button
                    onClick={saveSchedule}
                    disabled={saving}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center block disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存排班'}
                  </button>
                </div>
              </div>

              {/* 导游标签 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">导游可用性</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {guides.filter(g => g.isActive).map(guide => (
                    <div key={guide.id} className="space-y-2">
                      <button
                        onClick={() => setSelectedGuide(guide)}
                        className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                          selectedGuide?.id === guide.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{guide.name}</div>
                        <div className="text-sm text-gray-500">
                          {guide.languages.join(', ')} • {guide.rating}星
                        </div>
                      </button>
                      
                      {selectedGuide?.id === guide.id && (
                        <div className="mt-3 relative perspective-1000">
                          <div className={`transition-transform duration-500 transform-style-preserve-3d ${
                            showFullCalendar?.type === 'guide' && showFullCalendar?.id === guide.id 
                              ? 'rotate-y-180' 
                              : ''
                          }`}>
                            {/* 正面：日期占用情况 */}
                            <div className="p-3 bg-gray-50 rounded-md backface-hidden">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            日期占用情况
                            <div className="text-xs text-gray-500 mt-1">
                                  范围: {generateDateRange().length > 0 ? `${new Date(generateDateRange()[0]).toLocaleDateString('zh-CN')} 至 ${new Date(generateDateRange()[generateDateRange().length - 1]).toLocaleDateString('zh-CN')}` : '无旅行日期'} 
                              (共{generateDateRange().length}天)
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                  仅显示旅行团日期
                            </div>
                          </div>
                          <div className="space-y-2">
                            {/* 星期标题行 */}
                            <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-600">
                              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                <div key={day} className="text-center p-1">
                                  {day}
                                </div>
                              ))}
                            </div>
                            
                            {/* 日期网格 */}
                            <div className="grid grid-cols-7 gap-1 text-xs">
                              {generateDateRange().map((date, index) => {
                                const dateObj = new Date(date)
                                const isOccupied = guide.occupiedDates?.some(occupiedDate => 
                                  occupiedDate === date || 
                                      occupiedDate === date
                                )
                                const isTourDate = schedule.some(day => day.date === date)
                                const isAssigned = schedule.some(day => 
                                  day.date === date && 
                                  day.guides.some(g => g.guideId === guide.id)
                                )
                                
                                return (
                                  <div
                                    key={index}
                                    className={`p-1 text-center rounded border text-xs ${
                                      isOccupied 
                                        ? 'bg-red-100 border-red-300 text-red-700 border-solid' 
                                        : isAssigned
                                        ? 'bg-blue-100 border-blue-300 text-blue-700 border-solid'
                                        : isTourDate
                                        ? 'bg-green-100 border-green-300 text-green-700 border-solid'
                                        : 'bg-gray-100 border-gray-200 text-gray-500 border-dashed'
                                    }`}
                                        title={`${date}${isOccupied ? ' - 已占用' : isAssigned ? ' - 已安排' : isTourDate ? ' - 可安排' : ''}`}
                                  >
                                    <div className="font-medium text-sm">{dateObj.getDate()}</div>
                                    <div className="text-xs opacity-75">
                                      {dateObj.getMonth() + 1}.{dateObj.getDate()}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                              <span>已占用</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                              <span>已安排</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                              <span>可安排</span>
                            </div>

                            </div>
                              
                              {/* 翻转按钮 - 右下角 */}
                              <button
                                onClick={() => setShowFullCalendar({ type: 'guide', id: guide.id })}
                                className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full shadow-sm border border-gray-200"
                                title="查看完整日历"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* 背面：完整日历 */}
                            <div className="absolute inset-0 p-3 bg-gray-50 rounded-md backface-hidden rotate-y-180">
                              <GuideCalendar guide={guide} />
                              {/* 返回按钮 */}
                              <button
                                onClick={() => setShowFullCalendar(null)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full shadow-sm border border-gray-200"
                                title="返回"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 车辆标签 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">车辆可用性</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {vehicles.filter(v => v.isActive).map(vehicle => (
                    <div key={vehicle.id} className="space-y-2">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                          selectedVehicle?.id === vehicle.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">{vehicle.plateNumber}</div>
                        <div className="text-sm text-gray-500">
                          {vehicle.make} {vehicle.model} • {vehicle.capacity}人
                        </div>
                      </button>
                      
                      {selectedVehicle?.id === vehicle.id && (
                        <div className="mt-3 relative perspective-1000">
                          <div className={`transition-transform duration-500 transform-style-preserve-3d ${
                            showFullCalendar?.type === 'vehicle' && showFullCalendar?.id === vehicle.id 
                              ? 'rotate-y-180' 
                              : ''
                          }`}>
                            {/* 正面：日期占用情况 */}
                            <div className="p-3 bg-gray-50 rounded-md backface-hidden">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            日期占用情况
                            <div className="text-xs text-gray-500 mt-1">
                              范围: {generateDateRange().length > 0 ? `${new Date(generateDateRange()[0]).toLocaleDateString('zh-CN')} 至 ${new Date(generateDateRange()[generateDateRange().length - 1]).toLocaleDateString('zh-CN')}` : '无旅行日期'} 
                              (共{generateDateRange().length}天)
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              仅显示旅行团日期
                            </div>
                          </div>
                          <div className="space-y-2">
                            {/* 星期标题行 */}
                            <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-600">
                              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                <div key={day} className="text-center p-1">
                                  {day}
                                </div>
                              ))}
                            </div>
                            
                            {/* 日期网格 */}
                            <div className="grid grid-cols-7 gap-1 text-xs">
                              {generateDateRange().map((date, index) => {
                                const dateObj = new Date(date)
                                // 检查是否为硬冲突状态（事故、维修、保养、出租等，排除"使用"和"待命"）
                                const isHardConflict = vehicle.occupations?.some(occupation => 
                                  occupation.type !== '待命' && 
                                  occupation.type !== '使用' &&
                                  Array.isArray(occupation.dates) && 
                                  occupation.dates.includes(date)
                                )
                                
                                // 检查是否为"使用"状态
                                const isUsed = vehicle.occupations?.some(occupation => 
                                  occupation.type === '使用' && 
                                  Array.isArray(occupation.dates) && 
                                  occupation.dates.includes(date)
                                )
                                const isTourDate = schedule.some(day => day.date === date)
                                const isAssigned = schedule.some(day => 
                                  day.date === date && 
                                  day.guides.some(g => g.vehicleId === vehicle.id)
                                )
                                
                                // 调试信息：只在第一个车辆的第一个日期显示
                                if (vehicle.id === vehicles[0]?.id && index === 0) {
                                  console.log(`车辆 ${vehicle.plateNumber} 在 ${date} 的状态:`, {
                                    isHardConflict,
                                    isUsed,
                                    isTourDate,
                                    isAssigned,
                                    occupations: vehicle.occupations
                                  })
                                }
                                
                                return (
                                  <div
                                    key={index}
                                    className={`p-1 text-center rounded border text-xs ${
                                      isHardConflict 
                                        ? 'bg-red-100 border-red-300 text-red-700 border-solid' 
                                        : isUsed || isAssigned
                                        ? 'bg-blue-100 border-blue-300 text-blue-700 border-solid'
                                        : isTourDate
                                        ? 'bg-green-100 border-green-300 text-green-700 border-solid'
                                        : 'bg-gray-100 border-gray-200 text-gray-500 border-dashed'
                                    }`}
                                    title={`${date}${isHardConflict ? ' - 硬冲突' : isUsed || isAssigned ? ' - 已安排' : isTourDate ? ' - 可安排' : ''}`}
                                  >
                                    <div className="font-medium text-sm">{dateObj.getDate()}</div>
                                    <div className="text-xs opacity-75">
                                      {dateObj.getMonth() + 1}.{dateObj.getDate()}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                              <span>硬冲突</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                              <span>已安排</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                              <span>可安排</span>
                            </div>

                            </div>
                          
                              {/* 翻转按钮 - 右下角 */}
                              <button
                                onClick={() => setShowFullCalendar({ type: 'vehicle', id: vehicle.id })}
                                className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full shadow-sm border border-gray-200"
                                title="查看完整日历"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* 背面：完整日历 */}
                            <div className="absolute inset-0 p-3 bg-gray-50 rounded-md backface-hidden rotate-y-180">
                              <VehicleCalendar vehicle={vehicle} />
                              {/* 返回按钮 */}
                              <button
                                onClick={() => setShowFullCalendar(null)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full shadow-sm border border-gray-200"
                                title="返回"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>



              {/* 冲突检测 */}
              {conflicts.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-red-900">冲突检测</h2>
                  </div>
                  <div className="px-6 py-4 space-y-3">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-sm font-medium text-red-800 mb-1">
                          {conflict.type === 'guide' ? '导游冲突' : '车辆冲突'}
                        </div>
                        <div className="text-sm text-red-700">
                          <div>{conflict.name}</div>
                          <div className="text-xs">{conflict.date}</div>
                          <div className="text-xs">{conflict.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg">
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">排班提示</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 点击导游/车辆标签查看日期占用情况</li>
                    <li>• 红色：已占用，绿色：可安排，蓝色：已安排</li>
                    <li>• 系统根据旅行团的抵达和送机时间自动计算每一天的具体日期</li>
                    <li>• 为每天安排导游和车辆</li>
                    <li>• 检查资源冲突</li>
                    <li>• 安排导游住宿</li>
                    <li>• 可批量复制排班</li>
                    <li>• 保存前检查冲突</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
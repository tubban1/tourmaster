'use client'

import { useState } from 'react'

interface Vehicle {
  occupations: {
    type: '使用' | '维修' | '保养' | '事故' | '出租' | '待命'
    dates: string[]
  }[]
}

interface CalendarDate {
  date: Date
  isOccupied: boolean
  occupationType?: string
  isCurrentMonth: boolean
}

interface VehicleCalendarProps {
  vehicle: Vehicle
}

export default function VehicleCalendar({ vehicle }: VehicleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  // 生成日历数据
  const generateCalendar = (date: Date): CalendarDate[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 获取上个月的最后几天
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // 获取下个月的前几天
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const calendar: CalendarDate[] = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const isCurrentMonth = current.getMonth() === month
      const { isOccupied, occupationType } = getOccupationInfoForDate(current)
      
      calendar.push({
        date: new Date(current),
        isOccupied,
        occupationType,
        isCurrentMonth
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return calendar
  }

  // 本地日期格式化函数（避免时区问题）
  const formatYMDLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 检查日期是否被占用
  const isDateOccupied = (date: Date): boolean => {
    if (!vehicle?.occupations) return false
    const dateStr = formatYMDLocal(date)
    return vehicle.occupations.some(occ => Array.isArray(occ.dates) && occ.dates.includes(dateStr))
  }

  // 获取指定日期的占用信息（是否占用 + 类型，使用优先级最高）
  const getOccupationInfoForDate = (date: Date): { isOccupied: boolean; occupationType?: string } => {
    if (!vehicle?.occupations) return { isOccupied: false }
    const dateStr = formatYMDLocal(date)
    // 使用优先
    if (vehicle.occupations.some(occ => occ.type === '使用' && occ.dates?.includes(dateStr))) {
      return { isOccupied: true, occupationType: '使用' }
    }
    // 其他状态：维修、保养、事故、出租
    const other = vehicle.occupations.find(occ => occ.type !== '待命' && occ.dates?.includes(dateStr))
    if (other) return { isOccupied: true, occupationType: other.type }
    return { isOccupied: false }
  }

  const calendar = generateCalendar(currentDate)

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">车辆日历</h2>
      </div>
      <div className="px-6 py-4">
        {/* 日历导航 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-medium">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

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
          {calendar.map((day, index) => (
            <div
              key={index}
              className={`aspect-square p-1 text-xs ${
                !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-900'
              }`}
            >
              <div className={`w-full h-full flex items-center justify-center rounded ${
                day.isOccupied && day.occupationType
                  ? getOccupationTypeColor(day.occupationType)
                  : day.isCurrentMonth
                    ? 'hover:bg-gray-100'
                    : ''
              }`}>
                {day.date.getDate()}
              </div>

            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">图例：</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span className="text-xs text-gray-600">使用</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-100 rounded"></div>
              <span className="text-xs text-gray-600">维修</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-100 rounded"></div>
              <span className="text-xs text-gray-600">保养</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-rose-100 rounded"></div>
              <span className="text-xs text-gray-600">事故</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-100 rounded"></div>
              <span className="text-xs text-gray-600">出租</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
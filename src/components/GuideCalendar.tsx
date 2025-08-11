'use client'

import { useState } from 'react'

interface TourGuide {
  id: string
  name: string
  occupiedDates: any[]
}

interface CalendarDate {
  date: Date
  isOccupied: boolean
  isCurrentMonth: boolean
}

interface GuideCalendarProps {
  guide: TourGuide
}

export default function GuideCalendar({ guide }: GuideCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

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
      const isOccupied = isDateOccupied(current)
      
      calendar.push({
        date: new Date(current),
        isOccupied,
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
    if (!guide?.occupiedDates) return false
    const dateStr = formatYMDLocal(date)
    // 检查导游的占用日期，可能是字符串数组或对象数组
    return guide.occupiedDates.some((dateItem: any) => {
      if (typeof dateItem === 'string') {
        return dateItem === dateStr
      } else if (dateItem && typeof dateItem === 'object' && dateItem.date) {
        return dateItem.date === dateStr
      }
      return false
    })
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
        <h2 className="text-lg font-medium text-gray-900">导游日历</h2>
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
                day.isOccupied
                  ? 'bg-red-100 text-red-700'
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
              <span className="text-xs text-gray-600">占用</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <span className="text-xs text-gray-600">可用</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
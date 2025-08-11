import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 使用本地时区格式化为 YYYY-MM-DD，避免 toISOString 带来的日期偏移
function formatYMDLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 检查导游和车辆的可用性
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const { tourId, dates, guideIds, vehicleIds } = await request.json()

    if (!tourId || !dates || !Array.isArray(dates)) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }

    // 获取旅行团信息
    const tour = await prisma.tour.findUnique({
      where: { id: tourId }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限
    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const conflicts = []

    // 检查导游可用性
    if (guideIds && Array.isArray(guideIds)) {
      for (const guideId of guideIds) {
        if (!guideId) continue
        
        const guide = await prisma.tourGuide.findUnique({
          where: { id: guideId }
        })

        if (guide) {
          // 检查是否有其他旅行团在同一时间段使用该导游
          const existingBookings = await prisma.booking.findMany({
            where: {
              tour: {
                agencyId: tour.agencyId
              },
              startDate: { lte: new Date(dates[dates.length - 1]) },
              endDate: { gte: new Date(dates[0]) },
              assignedGuides: {
                path: ['$[*].guideId'],
                array_contains: guideId
              }
            }
          })

          for (const date of dates) {
            const dateStr = new Date(date).toISOString().split('T')[0]
            const hasConflict = existingBookings.some((booking: any) => {
              const bookingStart = new Date(booking.startDate)
              const bookingEnd = new Date(booking.endDate)
              const checkDate = new Date(dateStr)
              return checkDate >= bookingStart && checkDate <= bookingEnd
            })
            
            if (hasConflict) {
              conflicts.push({
                type: 'guide',
                id: guideId,
                name: guide.name,
                date: dateStr,
                message: `导游 ${guide.name} 在 ${dateStr} 已被占用`
              })
            }
          }
        }
      }
    }

    // 检查车辆可用性（基于 vehicles.occupations 的占用状态）
    if (vehicleIds && Array.isArray(vehicleIds)) {
      // 获取当前排班中已安排的车辆和日期组合
      const currentSchedule = await prisma.tour.findUnique({
        where: { id: tourId },
        select: {
          itineraryId: true
        }
      })
      
      // 如果有行程，获取行程的活动信息
      const currentVehicleDates = new Map<string, Set<string>>()
      if (currentSchedule?.itineraryId) {
        const itinerary = await prisma.itinerary.findUnique({
          where: { id: currentSchedule.itineraryId },
          select: {
            activities: true
          }
        })
        
        if (itinerary?.activities && Array.isArray(itinerary.activities)) {
          for (const activity of itinerary.activities) {
            if (activity.date && activity.guides && Array.isArray(activity.guides)) {
              for (const guide of activity.guides) {
                if (guide.vehicleId) {
                  if (!currentVehicleDates.has(guide.vehicleId)) {
                    currentVehicleDates.set(guide.vehicleId, new Set<string>())
                  }
                  currentVehicleDates.get(guide.vehicleId)?.add(activity.date)
                }
              }
            }
          }
        }
      }

      for (const vehicleId of vehicleIds) {
        if (!vehicleId) continue
        const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
        if (!vehicle) continue

        const occ = Array.isArray((vehicle as any).occupations) ? (vehicle as any).occupations as any[] : []
        const conflictingDates = new Set<string>()
        // 非“使用/待命”的状态（如 事故/维修/保养/出租）为硬冲突
        for (const o of occ) {
          // Consider all non-'待命' occupations as conflicts
          if (o && o.type !== '待命' && Array.isArray(o.dates)) {
            for (const d of o.dates) conflictingDates.add(d)
          }
        }

        for (const date of dates) {
          const dateStr = date // date is already YYYY-MM-DD from frontend
          
          // Check if there's a hard conflict (any non-'待命' occupation)
          if (conflictingDates.has(dateStr)) {
            // If the conflict is '使用' type, check if it's part of the current schedule (方案2)
            const isUsageConflict = occ.some((o: { type: string; dates: string[] }) => o.type === '使用' && Array.isArray(o.dates) && o.dates.includes(dateStr));
            const currentDates = currentVehicleDates.get(vehicleId);
            const isCurrentScheduleUsage = currentDates && currentDates.has(dateStr);

            if (isUsageConflict && isCurrentScheduleUsage) {
              // This is a '使用' conflict but it's for the current tour, so it's allowed (方案2)
              continue; 
            } else {
              // This is either a non-'使用' conflict (hard conflict) or a '使用' conflict from another tour
              const conflictType = occ.find((o: { type: string; dates: string[] }) => o.dates?.includes(dateStr))?.type || '占用';
              conflicts.push({
                type: 'vehicle',
                id: vehicleId,
                name: `${(vehicle as { make: string; model: string; plateNumber: string }).make} ${(vehicle as { make: string; model: string; plateNumber: string }).model} (${(vehicle as { make: string; model: string; plateNumber: string }).plateNumber})`,
                date: dateStr,
                message: `车辆 ${(vehicle as { make: string; model: string; plateNumber: string }).plateNumber} 在 ${dateStr} 为"${conflictType}"状态，不可安排`
              })
            }
          }
        }
      }
    }

    return NextResponse.json({
      available: conflicts.length === 0,
      conflicts
    })
  } catch (error) {
    console.error('Check availability error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
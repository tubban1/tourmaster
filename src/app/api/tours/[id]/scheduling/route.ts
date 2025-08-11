import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取旅行团排班信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const { id } = await params

    const tour = await prisma.tour.findUnique({
      where: { id },

    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限：只能查看自己旅行社的旅行团
    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 如果有行程ID，获取行程信息
    let itinerary = null
    if (tour.itineraryId) {
      itinerary = await prisma.itinerary.findUnique({
        where: { id: tour.itineraryId },
        select: {
          id: true,
          name: true,
          durationDays: true,
          activities: true
        }
      })
    }

    return NextResponse.json({
      ...tour,
      itinerary
    })
  } catch (error) {
    console.error('Get tour scheduling error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新旅行团排班信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 检查权限
    const allowedRoles = ['agency_admin', 'scheduler']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { id } = await params

    // 检查旅行团是否存在
    const existingTour = await prisma.tour.findUnique({
      where: { id }
    })

    if (!existingTour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限：只能编辑自己旅行社的旅行团
    if (existingTour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    if (!existingTour.itineraryId) {
      return NextResponse.json({ error: '旅行团未绑定行程' }, { status: 400 })
    }

    const { activities } = await request.json()

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: '排班数据格式错误' },
        { status: 400 }
      )
    }

    // 更新行程的activities
    const updatedItinerary = await prisma.itinerary.update({
      where: { id: existingTour.itineraryId },
      data: {
        activities: activities
      }
    })

    // 在保存排班前，先检查车辆占用冲突
    const conflicts = []
    const tourDates = new Set<string>()
    
    // 从activities中提取所有日期
    for (const activity of activities) {
      if (activity.date) {
        tourDates.add(activity.date)
      }
    }
    
    // 检查新排班中所有车辆的占用冲突
    for (const activity of activities) {
      if (activity.guides && Array.isArray(activity.guides)) {
        for (const guide of activity.guides) {
          if (guide.vehicleId) {
            const vehicle = await prisma.vehicle.findUnique({
              where: { id: guide.vehicleId },
              select: { id: true, plateNumber: true, make: true, model: true, occupations: true }
            })
            
            if (vehicle && activity.date) {
              const occ = Array.isArray(vehicle.occupations) ? vehicle.occupations : []
              
              // 检查是否有非"使用"状态的硬冲突
              for (const occupation of occ) {
                if (occupation.type !== '使用' && occupation.type !== '待命' && Array.isArray(occupation.dates)) {
                  if (occupation.dates.includes(activity.date)) {
                    conflicts.push({
                      type: 'vehicle',
                      id: vehicle.id,
                      name: `${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`,
                      date: activity.date,
                      message: `车辆 ${vehicle.plateNumber} 在 ${activity.date} 为"${occupation.type}"状态，不可安排`
                    })
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // 如果有冲突，阻止保存
    if (conflicts.length > 0) {
      return NextResponse.json({
        error: '存在车辆占用冲突',
        conflicts
      }, { status: 400 })
    }

    // 新的车辆占用状态管理流程：先清除，再检查，最后保存
    try {
      // 第一步：清除该旅行团所有车辆的"使用"状态
      const historicalVehicleIds = await getVehiclesUsedInTour(id)
      console.log('需要清除占用状态的历史车辆ID:', historicalVehicleIds)
      
      if (historicalVehicleIds.length > 0) {
        const historicalVehicles = await prisma.vehicle.findMany({
          where: { id: { in: historicalVehicleIds } },
          select: { id: true, occupations: true }
        })

        console.log('找到的历史车辆数据:', historicalVehicles.map((v: { id: string; occupations: any }) => ({
          id: v.id,
          occupations: v.occupations
        })))

        // 清除所有历史车辆的"使用"状态
        const clearUpdates = historicalVehicles.map((vehicle: { id: string; occupations: any }) => {
          const currentOccupations = Array.isArray(vehicle.occupations) ? vehicle.occupations : []
          console.log(`车辆 ${vehicle.id} 的当前占用状态:`, currentOccupations)
          
          // 移除"使用"状态，保留其他状态
          const filteredOccupations = currentOccupations
            .filter((o: any) => o && o.type !== '使用')
            .filter((o: any) => o && typeof o.type === 'string')
            .filter((o: any) => o.type !== '待命' && o.type !== '检测')
            .map((o: any) => ({ 
              type: o.type, 
              dates: Array.isArray(o.dates) ? o.dates : [] 
            }))
            .filter((o: any) => o.dates.length > 0)

          console.log(`车辆 ${vehicle.id} 清除后的占用状态:`, filteredOccupations)

          return prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { occupations: filteredOccupations }
          })
        })

        if (clearUpdates.length > 0) {
          await prisma.$transaction(clearUpdates)
          console.log('已清除历史车辆的"使用"状态')
        }
      }

      // 第二步：检查新排班的可用性
      const newVehicleIds = new Set<string>()
      const newVehicleDates: Record<string, Set<string>> = {}
      
      for (const day of activities as any[]) {
        const dayDate: string | undefined = day?.date
        if (!dayDate || !day?.guides) continue
        for (const g of day.guides as any[]) {
          const vehicleId: string | undefined = g?.vehicleId
          if (!vehicleId) continue
          newVehicleIds.add(vehicleId)
          if (!newVehicleDates[vehicleId]) newVehicleDates[vehicleId] = new Set<string>()
          newVehicleDates[vehicleId].add(dayDate)
        }
      }
      
      console.log('新排班中的车辆ID:', Array.from(newVehicleIds))
      console.log('新排班中车辆的使用日期:', Object.fromEntries(
        Object.entries(newVehicleDates).map(([id, dates]) => [id, Array.from(dates)])
      ))

      // 第三步：设置新排班中车辆的"使用"状态
      if (newVehicleIds.size > 0) {
        const newVehicles = await prisma.vehicle.findMany({
          where: { id: { in: Array.from(newVehicleIds) } },
          select: { id: true, occupations: true }
        })

        const setNewUpdates = newVehicles.map((vehicle: { id: string; occupations: any }) => {
          const currentOccupations = Array.isArray(vehicle.occupations) ? vehicle.occupations : []
          
          // 添加新的"使用"状态
          const newUsageRecord = {
            type: '使用',
            dates: Array.from(newVehicleDates[vehicle.id] || new Set<string>())
          }

          // 合并现有状态和新状态
          const updatedOccupations = [
            ...currentOccupations.filter((o: any) => o && o.type !== '使用'),
            newUsageRecord
          ].filter((o: any) => o && typeof o.type === 'string')
            .filter((o: any) => o.type !== '待命' && o.type !== '检测')
            .map((o: any) => ({ 
              type: o.type, 
              dates: Array.isArray(o.dates) ? o.dates : [] 
            }))
            .filter((o: any) => o.dates.length > 0 || o.type === '使用')

          return prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { occupations: updatedOccupations }
          })
        })

        if (setNewUpdates.length > 0) {
          await prisma.$transaction(setNewUpdates)
          console.log('已设置新排班车辆的"使用"状态')
        }
      }
    } catch (e) {
      console.error('车辆占用状态管理失败:', e)
      // 不影响主流程返回
    }

    return NextResponse.json({
      message: '排班信息更新成功',
      itinerary: updatedItinerary
    })
  } catch (error) {
    console.error('Update tour scheduling error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 辅助函数：获取旅行团中使用的所有车辆ID
async function getVehiclesUsedInTour(tourId: string): Promise<string[]> {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        itineraryId: true,
        overallArrivalTime: true,
        overallDepartureTime: true
      }
    })
    
    if (!tour?.itineraryId || !tour.overallArrivalTime || !tour.overallDepartureTime) return []
    
    // 计算旅行团的日期范围（前后各加3天）
    const startDate = new Date(tour.overallArrivalTime)
    const endDate = new Date(tour.overallDepartureTime)
    
    const extendedStartDate = new Date(startDate)
    extendedStartDate.setDate(startDate.getDate() - 3)
    const extendedEndDate = new Date(endDate)
    extendedEndDate.setDate(endDate.getDate() + 3)
    
    // 生成日期范围
    const tourDates: string[] = []
    let currentDate = new Date(extendedStartDate)
    while (currentDate <= extendedEndDate) {
      tourDates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    console.log('旅行团日期范围:', tourDates)
    
    // 查询所有车辆，找出任何在该日期范围内有占用状态的车辆（包括"使用"、"事故"、"维修"、"保养"、"出租"等）
    const allVehicles = await prisma.vehicle.findMany({
      select: { id: true, occupations: true }
    })
    
    const relatedVehicleIds = new Set<string>()
    for (const vehicle of allVehicles) {
      if (vehicle.occupations && Array.isArray(vehicle.occupations)) {
        for (const occupation of vehicle.occupations) {
          // 检查所有非"待命"的占用状态
          if (occupation.type !== '待命' && Array.isArray(occupation.dates)) {
            // 检查是否有任何日期与旅行团日期重叠
            const hasOverlap = occupation.dates.some((date: string) => tourDates.includes(date))
            if (hasOverlap) {
              relatedVehicleIds.add(vehicle.id)
              console.log(`车辆 ${vehicle.id} 在旅行团日期范围内有${occupation.type}占用:`, occupation.dates)
            }
          }
        }
      }
    }
    
    const result = Array.from(relatedVehicleIds)
    console.log('找到的相关车辆ID:', result)
    return result
    
  } catch (error) {
    console.error('获取旅行团车辆失败:', error)
    return []
  }
} 
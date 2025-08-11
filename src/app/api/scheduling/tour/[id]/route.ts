import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取旅行团排班信息和可用资源
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json({ error: '需要提供开始和结束日期' }, { status: 400 })
    }

    // 获取旅行团信息
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        itinerary: true,
        agency: {
          select: { id: true, name: true }
        }
      }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限
    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 生成日期范围
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dates = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0])
    }

    // 获取可用导游
    const availableGuides = await prisma.tourGuide.findMany({
      where: {
        agencyAssignments: {
          some: {
            agencyId: tour.agencyId,
            isActiveInAgency: true
          }
        },
        isActive: true
      },
      include: {
        agencyAssignments: {
          where: {
            agencyId: tour.agencyId
          }
        }
      }
    })

    // 获取可用车辆
    const availableVehicles = await prisma.vehicle.findMany({
      where: {
        agencyId: tour.agencyId,
        isActive: true
      }
    })

    // 检查导游在指定日期的可用性
    const guideAvailability = await Promise.all(
      availableGuides.map(async (guide) => {
        const availability = dates.map(date => {
          // 检查导游在该日期是否已被其他旅行团占用
          const conflicts = prisma.itinerary.findMany({
            where: {
              agencyId: tour.agencyId,
              activities: {
                path: ['$[*].guides[*].guideId'],
                array_contains: [guide.id]
              }
            }
          })

          return {
            date,
            available: true // 暂时设为true，后续优化冲突检测
          }
        })

        return {
          id: guide.id,
          name: guide.name,
          languages: guide.languages as string[],
          specialties: guide.specialties as string[],
          rating: guide.rating,
          availability
        }
      })
    )

    // 检查车辆在指定日期的可用性
    const vehicleAvailability = await Promise.all(
      availableVehicles.map(async (vehicle) => {
        const availability = dates.map(date => {
          // 检查车辆在该日期是否已被其他旅行团占用
          const conflicts = prisma.itinerary.findMany({
            where: {
              agencyId: tour.agencyId,
              activities: {
                path: ['$[*].guides[*].vehicleId'],
                array_contains: [vehicle.id]
              }
            }
          })

          return {
            date,
            available: true // 暂时设为true，后续优化冲突检测
          }
        })

        return {
          id: vehicle.id,
          plateNumber: vehicle.plateNumber,
          make: vehicle.make,
          model: vehicle.model,
          capacity: vehicle.capacity,
          type: vehicle.type,
          availability
        }
      })
    )

    // 获取现有的排班数据（如果有）
    let existingScheduling = null
    if (tour.itineraryId) {
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: tour.itineraryId }
      })
      
      if (itinerary && itinerary.activities) {
        const activities = itinerary.activities as any
        existingScheduling = dates.map((date, index) => {
          const activity = activities[index]
          if (activity && activity.guides) {
            return {
              date,
              guides: activity.guides.map((g: any) => ({
                guideId: g.guideId,
                vehicleId: g.vehicleId,
                accommodation: g.guideAccommodation?.hotelName || '',
                notes: g.guideAccommodation?.notes || ''
              }))
            }
          }
          return {
            date,
            guides: []
          }
        })
      }
    }

    return NextResponse.json({
      tour,
      dates,
      guideAvailability,
      vehicleAvailability,
      existingScheduling
    })
  } catch (error) {
    console.error('获取排班信息失败:', error)
    return NextResponse.json({ error: '获取排班信息失败' }, { status: 500 })
  }
}

// 保存排班安排
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params
    const {
      startDate,
      endDate,
      dailyAssignments,
      notes
    } = await request.json()

    if (!startDate || !endDate || !dailyAssignments || !Array.isArray(dailyAssignments)) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }

    // 获取旅行团信息
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        itinerary: true
      }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限
    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    if (!tour.itineraryId) {
      return NextResponse.json({ error: '旅行团未绑定行程，无法保存排班数据' }, { status: 400 })
    }

    // 检查是否有冲突
    const conflicts = []
    for (const assignment of dailyAssignments) {
      const { date, guides } = assignment

      // 检查导游冲突
      if (guides && Array.isArray(guides)) {
        for (const guide of guides) {
          if (guide.guideId) {
            // 检查导游在该日期是否已被其他旅行团占用
            const guideConflicts = await prisma.itinerary.findMany({
              where: {
                agencyId: tour.agencyId,
                id: { not: tour.itineraryId }, // 排除当前旅行团
                activities: {
                  path: ['$[*].guides[*].guideId'],
                  array_contains: [guide.guideId]
                }
              }
            })

            if (guideConflicts.length > 0) {
              conflicts.push({
                type: 'guide',
                date,
                guideId: guide.guideId,
                message: `导游在 ${date} 已被其他旅行团占用`
              })
            }
          }
        }
      }

      // 检查车辆冲突
      for (const guide of guides) {
        if (guide.vehicleId) {
          const vehicleConflicts = await prisma.itinerary.findMany({
            where: {
              agencyId: tour.agencyId,
              id: { not: tour.itineraryId }, // 排除当前旅行团
              activities: {
                path: ['$[*].guides[*].vehicleId'],
                array_contains: [guide.vehicleId]
              }
            }
          })

          if (vehicleConflicts.length > 0) {
            conflicts.push({
              type: 'vehicle',
              date,
              vehicleId: guide.vehicleId,
              message: `车辆在 ${date} 已被其他旅行团占用`
            })
          }
        }
      }
    }

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: '存在资源冲突',
        conflicts
      }, { status: 400 })
    }

    // 获取现有的itinerary数据
    const existingItinerary = await prisma.itinerary.findUnique({
      where: { id: tour.itineraryId }
    })

    if (!existingItinerary) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    // 构建新的activities数据，包含排班信息
    const existingActivities = existingItinerary.activities as any || []
    const newActivities = existingActivities.map((activity: any, index: number) => {
      const assignment = dailyAssignments[index]
      
      if (assignment && assignment.guides) {
        return {
          ...activity,
          guides: assignment.guides.map((guide: any) => ({
            guideId: guide.guideId,
            vehicleId: guide.vehicleId || null,
            guideAccommodation: guide.accommodation ? {
              hotelName: guide.accommodation,
              notes: guide.notes || ''
            } : null,
            status: '已安排'
          }))
        }
      }
      
      return activity
    })

    // 更新itinerary表的activities字段
    const updatedItinerary = await prisma.itinerary.update({
      where: { id: tour.itineraryId },
      data: {
        activities: newActivities
      }
    })

    return NextResponse.json({
      message: '排班安排保存成功',
      itinerary: updatedItinerary
    })
  } catch (error) {
    console.error('保存排班安排失败:', error)
    return NextResponse.json({ error: '保存排班安排失败' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // 构建查询条件
    const where: any = {
      agencyId: payload.role === 'platform_super_admin' ? undefined : payload.agencyId
    }

    // 如果指定了状态，添加状态过滤
    if (status) {
      const statusArray = status.split(',')
      where.status = {
        in: statusArray
      }
    }

    const tours = await prisma.tour.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 为有itineraryId的旅行团获取行程信息
    const toursWithItineraries = await Promise.all(
      tours.map(async (tour: any) => {
        if (tour.itineraryId) {
          const itinerary = await prisma.itinerary.findUnique({
            where: { id: tour.itineraryId },
            select: {
              id: true,
              name: true,
              durationDays: true
            }
          })
          return { ...tour, itinerary }
        }
        return { ...tour, itinerary: null }
      })
    )

    return NextResponse.json(toursWithItineraries)
  } catch (error) {
    console.error('获取旅行团列表失败:', error)
    return NextResponse.json({ error: '获取旅行团列表失败' }, { status: 500 })
  }
}

// 创建新旅行团
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查权限
    const allowedRoles = ['agency_admin', 'sales']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const {
      name,
      itineraryId,
      maxCapacity,
      notes,
      overallArrivalTime,
      overallDepartureTime,
      pickupSignInfo,
      flightDetails
    } = await request.json()

    if (!name || !maxCapacity) {
      return NextResponse.json(
        { error: '团名和最大容量是必填字段' },
        { status: 400 }
      )
    }

    // 验证和格式化时间字段
    let formattedArrivalTime = undefined
    let formattedDepartureTime = undefined

    if (overallArrivalTime) {
      try {
        if (typeof overallArrivalTime === 'string') {
          const testDate = new Date(overallArrivalTime)
          if (!isNaN(testDate.getTime())) {
            formattedArrivalTime = testDate.toISOString()
          } else {
            return NextResponse.json(
              { error: '抵达时间格式无效' },
              { status: 400 }
            )
          }
        } else {
          return NextResponse.json(
            { error: '抵达时间必须是字符串' },
            { status: 400 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: '抵达时间格式无效' },
          { status: 400 }
        )
      }
    }

    if (overallDepartureTime) {
      try {
        if (typeof overallDepartureTime === 'string') {
          const testDate = new Date(overallDepartureTime)
          if (!isNaN(testDate.getTime())) {
            formattedDepartureTime = testDate.toISOString()
          } else {
            return NextResponse.json(
              { error: '送机时间格式无效' },
              { status: 400 }
            )
          }
        } else {
          return NextResponse.json(
            { error: '送机时间必须是字符串' },
            { status: 400 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: '送机时间格式无效' },
          { status: 400 }
        )
      }
    }

    // 验证和格式化航班时间
    if (flightDetails) {
      if (flightDetails.outboundFlight) {
        if (flightDetails.outboundFlight.departureTime) {
          try {
            const testDate = new Date(flightDetails.outboundFlight.departureTime)
            if (!isNaN(testDate.getTime())) {
              flightDetails.outboundFlight.departureTime = testDate.toISOString()
            } else {
              return NextResponse.json(
                { error: '去程航班起飞时间格式无效' },
                { status: 400 }
              )
            }
          } catch (error) {
            return NextResponse.json(
              { error: '去程航班起飞时间格式无效' },
              { status: 400 }
            )
          }
        }
        
        if (flightDetails.outboundFlight.arrivalTime) {
          try {
            const testDate = new Date(flightDetails.outboundFlight.arrivalTime)
            if (!isNaN(testDate.getTime())) {
              flightDetails.outboundFlight.arrivalTime = testDate.toISOString()
            } else {
              return NextResponse.json(
                { error: '去程航班到达时间格式无效' },
                { status: 400 }
              )
            }
          } catch (error) {
            return NextResponse.json(
              { error: '去程航班到达时间格式无效' },
              { status: 400 }
            )
          }
        }
      }

      if (flightDetails.returnFlight) {
        if (flightDetails.returnFlight.departureTime) {
          try {
            const testDate = new Date(flightDetails.returnFlight.departureTime)
            if (!isNaN(testDate.getTime())) {
              flightDetails.returnFlight.departureTime = testDate.toISOString()
            } else {
              return NextResponse.json(
                { error: '返程航班起飞时间格式无效' },
                { status: 400 }
              )
            }
          } catch (error) {
            return NextResponse.json(
              { error: '返程航班起飞时间格式无效' },
              { status: 400 }
            )
          }
        }
        
        if (flightDetails.returnFlight.arrivalTime) {
          try {
            const testDate = new Date(flightDetails.returnFlight.arrivalTime)
            if (!isNaN(testDate.getTime())) {
              flightDetails.returnFlight.arrivalTime = testDate.toISOString()
            } else {
              return NextResponse.json(
                { error: '返程航班到达时间格式无效' },
                { status: 400 }
              )
            }
          } catch (error) {
            return NextResponse.json(
              { error: '返程航班到达时间格式无效' },
              { status: 400 }
            )
          }
        }
      }
    }

    const tour = await prisma.tour.create({
      data: {
        agencyId: payload.agencyId,
        name,
        itineraryId,
        maxCapacity,
        notes,
        overallArrivalTime: formattedArrivalTime,
        overallDepartureTime: formattedDepartureTime,
        pickupSignInfo,
        flightDetails,
        status: 'planned'
      },
      include: {
        agency: true
      }
    })

    return NextResponse.json(tour, { status: 201 })
  } catch (error) {
    console.error('创建旅行团失败:', error)
    return NextResponse.json({ error: '创建旅行团失败' }, { status: 500 })
  }
} 
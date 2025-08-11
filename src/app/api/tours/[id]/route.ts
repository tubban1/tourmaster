import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true
          }
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

    // 如果有itineraryId，获取行程信息
    let itinerary = null
    if (tour.itineraryId) {
      itinerary = await prisma.itinerary.findUnique({
        where: { id: tour.itineraryId },
        select: {
          id: true,
          name: true,
          durationDays: true,
          activities: true // 包含完整的activities数据，包括guides信息
        }
      })
    }

    return NextResponse.json({
      ...tour,
      itinerary
    })
  } catch (error) {
    console.error('获取旅行团信息失败:', error)
    return NextResponse.json({ error: '获取旅行团信息失败' }, { status: 500 })
  }
}

// 更新旅行团信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params

    // 检查权限
    const allowedRoles = ['agency_admin', 'sales']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

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

    const {
      name,
      itineraryId,
      status,
      maxCapacity,
      actualCost,
      actualRevenue,
      notes,
      overallArrivalTime,
      overallDepartureTime,
      pickupSignInfo,
      flightDetails
    } = await request.json()

    if (!name || !status || !maxCapacity) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证和格式化时间字段
    let formattedArrivalTime = undefined
    let formattedDepartureTime = undefined

    if (overallArrivalTime) {
      try {
        // 尝试直接使用原始时间字符串
        if (typeof overallArrivalTime === 'string') {
          // 检查是否是有效的ISO时间格式
          const testDate = new Date(overallArrivalTime)
          if (!isNaN(testDate.getTime())) {
            // 确保时间格式是完整的ISO-8601格式
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
        // 尝试直接使用原始时间字符串
        if (typeof overallDepartureTime === 'string') {
          // 检查是否是有效的ISO时间格式
          const testDate = new Date(overallDepartureTime)
          if (!isNaN(testDate.getTime())) {
            // 确保时间格式是完整的ISO-8601格式
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

    console.log('API接收到的原始时间:', { overallArrivalTime, overallDepartureTime })
    console.log('API格式化后的时间:', { formattedArrivalTime, formattedDepartureTime })
    console.log('时间字段类型:', {
      overallArrivalTimeType: typeof overallArrivalTime,
      overallDepartureTimeType: typeof overallDepartureTime,
      formattedArrivalTimeType: typeof formattedArrivalTime,
      formattedDepartureTimeType: typeof formattedDepartureTime
    })
    console.log('时间字段长度:', {
      overallArrivalTimeLength: overallArrivalTime ? overallArrivalTime.length : 0,
      overallDepartureTimeLength: overallDepartureTime ? overallDepartureTime.length : 0,
      formattedArrivalTimeLength: formattedArrivalTime ? formattedArrivalTime.length : 0,
      formattedDepartureTimeLength: formattedDepartureTime ? formattedDepartureTime.length : 0
    })
    console.log('时间字段测试:', {
      arrivalDateTest: overallArrivalTime ? new Date(overallArrivalTime) : null,
      departureDateTest: overallDepartureTime ? new Date(overallDepartureTime) : null,
      arrivalDateValid: overallArrivalTime ? !isNaN(new Date(overallArrivalTime).getTime()) : true,
      departureDateValid: overallDepartureTime ? !isNaN(new Date(overallDepartureTime).getTime()) : true
    })

    // 构建更新数据
    const updateData = {
      name,
      itineraryId,
      status,
      maxCapacity,
      actualCost,
      actualRevenue,
      notes,
      overallArrivalTime: formattedArrivalTime,
      overallDepartureTime: formattedDepartureTime,
      pickupSignInfo,
      flightDetails
    }
    
    console.log('发送给Prisma的完整数据:', updateData)

    const tour = await prisma.tour.update({
      where: { id },
      data: updateData,
      include: {
        agency: true
      }
    })

    return NextResponse.json(tour)
  } catch (error) {
    console.error('更新旅行团失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 删除旅行团
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params

    // 检查权限
    const allowedRoles = ['agency_admin']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查旅行团是否存在
    const existingTour = await prisma.tour.findUnique({
      where: { id }
    })

    if (!existingTour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限：只能删除自己旅行社的旅行团
    if (existingTour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    await prisma.tour.delete({
      where: { id }
    })

    return NextResponse.json({ message: '旅行团删除成功' })
  } catch (error) {
    console.error('删除旅行团失败:', error)
    return NextResponse.json({ error: '删除旅行团失败' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取行程列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unbound = searchParams.get('unbound')

    let itineraries

    if (payload.role === 'platform_super_admin') {
      // 平台超级管理员可以看到所有行程
      if (unbound === 'true') {
        // 获取所有已绑定的行程ID
        const boundItineraryIds = await prisma.tour.findMany({
          where: { itineraryId: { not: null } },
          select: { itineraryId: true }
        }).then((tours: { itineraryId: string }[]) => tours.map((t: { itineraryId: string }) => t.itineraryId))
        
        itineraries = await prisma.itinerary.findMany({
          where: {
            id: { notIn: boundItineraryIds }
          },
          include: {
            agency: true,
            creator: true
          },
          orderBy: { createdAt: 'desc' }
        })
      } else {
        itineraries = await prisma.itinerary.findMany({
          include: {
            agency: true,
            creator: true
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    } else {
      // 旅行社用户只能看到自己旅行社的行程
      if (unbound === 'true') {
        // 获取当前旅行社已绑定的行程ID
        const boundItineraryIds = await prisma.tour.findMany({
          where: { 
            agencyId: payload.agencyId,
            itineraryId: { not: null } 
          },
          select: { itineraryId: true }
        }).then((tours: { itineraryId: string }[]) => tours.map((t: { itineraryId: string }) => t.itineraryId))
        
        itineraries = await prisma.itinerary.findMany({
          where: {
            agencyId: payload.agencyId,
            id: { notIn: boundItineraryIds }
          },
          include: {
            agency: true,
            creator: true
          },
          orderBy: { createdAt: 'desc' }
        })
      } else {
        itineraries = await prisma.itinerary.findMany({
          where: {
            agencyId: payload.agencyId
          },
          include: {
            agency: true,
            creator: true
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    }

    return NextResponse.json(itineraries)
  } catch (error) {
    console.error('获取行程列表失败:', error)
    return NextResponse.json({ error: '获取行程列表失败' }, { status: 500 })
  }
}

// 创建新行程
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
      description,
      durationDays,
      destinations,
      activities,
      costEstimation,
      inclusion,
      exclusion
    } = await request.json()

    if (!name || !description || !durationDays || !destinations || !costEstimation) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const itinerary = await prisma.itinerary.create({
      data: {
        name,
        description,
        durationDays,
        destinations,
        activities: activities || [],
        costEstimation,
        inclusion: inclusion || [],
        exclusion: exclusion || [],
        agencyId: payload.agencyId,
        createdBy: payload.userId,
        isActive: true
      },
      include: {
        creator: {
          select: { username: true }
        },
        agency: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(itinerary, { status: 201 })
  } catch (error) {
    console.error('创建行程失败:', error)
    return NextResponse.json({ error: '创建行程失败' }, { status: 500 })
  }
} 
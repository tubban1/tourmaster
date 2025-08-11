import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 复制行程
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 检查权限
    const allowedRoles = ['agency_admin', 'sales']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 获取原行程
    const originalItinerary = await prisma.itinerary.findUnique({
      where: { id: params.id }
    })

    if (!originalItinerary) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    // 检查权限：只能复制自己旅行社的行程
    if (payload.role !== 'platform_super_admin' && originalItinerary.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 创建复制的行程
    const copiedItinerary = await prisma.itinerary.create({
      data: {
        name: `${originalItinerary.name} 副本`,
        description: originalItinerary.description,
        durationDays: originalItinerary.durationDays,
        destinations: originalItinerary.destinations,
        activities: originalItinerary.activities,
        costEstimation: originalItinerary.costEstimation,
        inclusion: originalItinerary.inclusion,
        exclusion: originalItinerary.exclusion,
        isActive: true,
        createdBy: payload.userId,
        agencyId: payload.agencyId
      },
      include: {
        creator: {
          select: { username: true }
        }
      }
    })

    return NextResponse.json(copiedItinerary, { status: 201 })
  } catch (error) {
    console.error('Copy itinerary error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
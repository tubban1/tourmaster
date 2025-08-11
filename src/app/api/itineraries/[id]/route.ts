import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取单个行程信息
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

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            username: true
          }
        },
        agency: {
          select: {
            name: true
          }
        }
      }
    })

    if (!itinerary) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    // 检查权限：只能查看自己旅行社的行程
    if (payload.role !== 'platform_super_admin' && itinerary.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('Get itinerary error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新行程信息
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
    const allowedRoles = ['agency_admin', 'scheduler']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查行程是否存在
    const existingItinerary = await prisma.itinerary.findUnique({
      where: { id }
    })

    if (!existingItinerary) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    // 检查权限：只能编辑自己旅行社的行程
    if (existingItinerary.agencyId !== payload.agencyId) {
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
      exclusion,
      isActive
    } = await request.json()

    if (!name || !description || !durationDays || !destinations || !activities) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const itinerary = await prisma.itinerary.update({
      where: { id },
      data: {
        name,
        description,
        durationDays,
        destinations,
        activities,
        costEstimation,
        inclusion,
        exclusion,
        isActive
      },
      include: {
        agency: {
          select: { name: true }
        },
        creator: {
          select: { username: true, email: true }
        }
      }
    })

    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('更新行程失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 删除行程
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

    // 检查行程是否存在
    const existingItinerary = await prisma.itinerary.findUnique({
      where: { id }
    })

    if (!existingItinerary) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    // 检查权限：只能删除自己旅行社的行程
    if (existingItinerary.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查是否被旅行团绑定
    const boundTour = await prisma.tour.findFirst({
      where: { itineraryId: id }
    })

    if (boundTour) {
      return NextResponse.json({ error: '该行程已被旅行团绑定，无法删除' }, { status: 400 })
    }

    // 删除行程
    await prisma.itinerary.delete({
      where: { id }
    })

    return NextResponse.json({ message: '行程删除成功' })
  } catch (error) {
    console.error('删除行程失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
} 
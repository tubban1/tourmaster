import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查权限
    if (!['agency_admin', 'scheduler', 'sales'].includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { id: tourId } = await params
    const { itineraryId } = await request.json()

    if (!itineraryId) {
      return NextResponse.json({ error: '行程ID不能为空' }, { status: 400 })
    }

    // 验证旅行团和行程是否存在且属于同一旅行社
    const [tour, itinerary] = await Promise.all([
      prisma.tour.findUnique({
        where: { id: tourId },
        include: { agency: true }
      }),
      prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: { agency: true }
      })
    ])

    if (!tour || !itinerary) {
      return NextResponse.json({ error: '旅行团或行程不存在' }, { status: 404 })
    }

    if (tour.agencyId !== itinerary.agencyId) {
      return NextResponse.json({ error: '旅行团和行程必须属于同一旅行社' }, { status: 400 })
    }

    // 检查行程是否已被其他旅行团绑定
    const existingTour = await prisma.tour.findFirst({
      where: { itineraryId: itineraryId }
    })

    if (existingTour && existingTour.id !== tourId) {
      return NextResponse.json({ error: '该行程已被其他旅行团绑定' }, { status: 400 })
    }

    // 更新旅行团的行程绑定
    const updatedTour = await prisma.tour.update({
      where: { id: tourId },
      data: { itineraryId: itineraryId },
      include: {
        agency: true
      }
    })

    return NextResponse.json({ 
      message: '绑定成功', 
      tour: updatedTour 
    })
  } catch (error) {
    console.error('绑定行程失败:', error)
    return NextResponse.json({ error: '绑定失败' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查权限
    if (!['agency_admin', 'scheduler', 'sales'].includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { id: tourId } = await params

    // 验证旅行团是否存在
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: { agency: true }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 解绑行程
    const updatedTour = await prisma.tour.update({
      where: { id: tourId },
      data: { itineraryId: null },
      include: {
        agency: true
      }
    })

    return NextResponse.json({ 
      message: '解绑成功', 
      tour: updatedTour 
    })
  } catch (error) {
    console.error('解绑行程失败:', error)
    return NextResponse.json({ error: '解绑失败' }, { status: 500 })
  }
} 
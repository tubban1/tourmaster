import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取旅行团的所有团员
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

    // 检查旅行团是否存在
    const tour = await prisma.tour.findUnique({
      where: { id }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限：只能查看自己旅行社的旅行团
    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const members = await prisma.tourMember.findMany({
      where: { tourId: id },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('获取旅行团团员失败:', error)
    return NextResponse.json({ error: '获取旅行团团员失败' }, { status: 500 })
  }
}

// 为旅行团添加新团员
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
    const allowedRoles = ['agency_admin', 'sales']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { id } = await params

    // 检查旅行团是否存在
    const tour = await prisma.tour.findUnique({
      where: { id }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    // 检查权限：只能为自己旅行社的旅行团添加团员
    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查旅行团容量
    const currentMembersCount = await prisma.tourMember.count({
      where: { tourId: id }
    })

    if (currentMembersCount >= tour.maxCapacity) {
      return NextResponse.json(
        { error: '旅行团已满员' },
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      passportNumber,
      contactEmail,
      contactPhone,
      emergencyContactName,
      emergencyContactPhone,
      healthNotes,
      dietaryRestrictions
    } = await request.json()

    if (!firstName || !lastName || !gender || !dateOfBirth || !passportNumber) {
      return NextResponse.json(
        { error: '请填写所有必填字段（姓名、性别、出生日期、护照号）' },
        { status: 400 }
      )
    }

    const member = await prisma.tourMember.create({
      data: {
        tourId: id,
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        passportNumber,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        healthNotes: healthNotes || null,
        dietaryRestrictions: dietaryRestrictions || null
      }
    })

    // 更新旅行团的当前团员数量
    await prisma.tour.update({
      where: { id },
      data: {
        currentMembersCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('添加团员失败:', error)
    return NextResponse.json({ error: '添加团员失败' }, { status: 500 })
  }
} 
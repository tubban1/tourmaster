import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取团员列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 根据用户角色返回不同的团员列表
    let members
    if (payload.role === 'platform_super_admin') {
      // 平台超级管理员可以看到所有团员
      members = await prisma.tourMember.findMany({
        include: {
          tour: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // 旅行社用户只能看到自己旅行社的团员
      members = await prisma.tourMember.findMany({
        where: {
          tour: {
            agencyId: payload.agencyId
          }
        },
        include: {
          tour: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(members)
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建新团员
export async function POST(request: NextRequest) {
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

    const {
      tourId,
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

    if (!tourId || !firstName || !lastName || !gender || !dateOfBirth || !passportNumber) {
      return NextResponse.json(
        { error: '请填写所有必填字段（姓名、性别、出生日期、护照号）' },
        { status: 400 }
      )
    }

    // 检查旅行团是否存在且属于当前旅行社
    const tour = await prisma.tour.findUnique({
      where: { id: tourId }
    })

    if (!tour) {
      return NextResponse.json({ error: '旅行团不存在' }, { status: 404 })
    }

    if (payload.role !== 'platform_super_admin' && tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查旅行团容量
    const currentMembersCount = await prisma.tourMember.count({
      where: { tourId }
    })

    if (currentMembersCount >= tour.maxCapacity) {
      return NextResponse.json(
        { error: '旅行团已满员' },
        { status: 400 }
      )
    }

    const member = await prisma.tourMember.create({
      data: {
        tourId,
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        passportNumber,
        contactEmail,
        contactPhone,
        emergencyContactName,
        emergencyContactPhone,
        healthNotes,
        dietaryRestrictions
      },
      include: {
        tour: {
          select: { id: true, name: true }
        }
      }
    })

    // 更新旅行团的当前人数
    await prisma.tour.update({
      where: { id: tourId },
      data: {
        currentMembersCount: currentMembersCount + 1
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
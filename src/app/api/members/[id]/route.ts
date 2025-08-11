import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取单个成员详情
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

    const member = await prisma.tourMember.findUnique({
      where: { id },
      include: {
        tour: {
          include: {
            agency: true
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: '成员不存在' }, { status: 404 })
    }

    // 检查权限：只能查看自己旅行社的成员
    if (payload.role !== 'platform_super_admin' && member.tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('获取成员详情失败:', error)
    return NextResponse.json({ error: '获取成员详情失败' }, { status: 500 })
  }
}

// 更新成员信息
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

    // 检查成员是否存在
    const existingMember = await prisma.tourMember.findUnique({
      where: { id },
      include: {
        tour: true
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: '成员不存在' }, { status: 404 })
    }

    // 检查权限：只能编辑自己旅行社的成员
    if (existingMember.tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
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
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const member = await prisma.tourMember.update({
      where: { id },
      data: {
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
          include: {
            agency: true
          }
        }
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('更新成员失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 删除成员
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
    const allowedRoles = ['agency_admin', 'sales']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查成员是否存在
    const existingMember = await prisma.tourMember.findUnique({
      where: { id },
      include: {
        tour: true
      }
    })

    if (!existingMember) {
      return NextResponse.json({ error: '成员不存在' }, { status: 404 })
    }

    // 检查权限：只能删除自己旅行社的成员
    if (existingMember.tour.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 删除成员
    await prisma.tourMember.delete({
      where: { id }
    })

    return NextResponse.json({ message: '成员删除成功' })
  } catch (error) {
    console.error('删除成员失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
} 
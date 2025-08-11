import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取单个导游详情
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

    const guide = await prisma.tourGuide.findUnique({
      where: { id },
      include: {
        agencyAssignments: {
          include: {
            agency: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!guide) {
      return NextResponse.json({ error: '导游不存在' }, { status: 404 })
    }

    return NextResponse.json(guide)
  } catch (error) {
    console.error('Get guide error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新导游信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    const { id } = await params

    // 检查权限
    const allowedRoles = ['agency_admin', 'guide']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查导游是否存在
    const existingGuide = await prisma.tourGuide.findUnique({
      where: { id }
    })

    if (!existingGuide) {
      return NextResponse.json({ error: '导游不存在' }, { status: 404 })
    }

    const {
      name,
      gender,
      contactPhone,
      languages,
      specialties,
      rating,
      notes,
      isActive
    } = await request.json()

    if (!name || !gender || !contactPhone) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const guide = await prisma.tourGuide.update({
      where: { id },
      data: {
        name,
        gender,
        contactPhone,
        languages: languages || [],
        specialties: specialties || [],
        rating: rating || 0,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : existingGuide.isActive
      },
      include: {
        agencyAssignments: {
          include: {
            agency: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json(guide)
  } catch (error) {
    console.error('Update guide error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除导游
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 检查权限
    const allowedRoles = ['platform_super_admin']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const guide = await prisma.tourGuide.findUnique({
      where: { id: params.id },
      include: {
        agencyAssignments: { select: { id: true } }
      }
    })

    if (!guide) {
      return NextResponse.json({ error: '导游不存在' }, { status: 404 })
    }

    // 检查是否可以删除（没有旅行社分配）
    if (guide.agencyAssignments.length > 0) {
      return NextResponse.json(
        { error: '无法删除：该导游还有旅行社分配' },
        { status: 400 }
      )
    }

    await prisma.tourGuide.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: '导游删除成功' })
  } catch (error) {
    console.error('Delete guide error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取单个旅行社信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params

    // 平台超级管理员可以查看任何旅行社
    if (payload.role === 'platform_super_admin') {
      const agency = await prisma.agency.findUnique({
        where: { id }
      })

      if (!agency) {
        return NextResponse.json({ error: '旅行社不存在' }, { status: 404 })
      }

      return NextResponse.json(agency)
    }

    // 旅行社管理员只能查看自己的旅行社
    if (payload.role === 'agency_admin') {
      if (payload.agencyId !== id) {
        return NextResponse.json({ error: '只能查看自己的旅行社信息' }, { status: 403 })
      }

      const agency = await prisma.agency.findUnique({
        where: { id }
      })

      if (!agency) {
        return NextResponse.json({ error: '旅行社不存在' }, { status: 404 })
      }

      return NextResponse.json(agency)
    }

    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  } catch (error) {
    console.error('Get agency error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 更新旅行社信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { id } = await params
    const { name, contactEmail, contactPhone, address } = await request.json()

    if (!name || !contactEmail || !contactPhone || !address) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      )
    }

    // 平台超级管理员可以更新任何旅行社
    if (payload.role === 'platform_super_admin') {
      const agency = await prisma.agency.update({
        where: { id },
        data: {
          name,
          contactEmail,
          contactPhone,
          address
        }
      })

      return NextResponse.json(agency)
    }

    // 旅行社管理员只能更新自己的旅行社
    if (payload.role === 'agency_admin') {
      if (payload.agencyId !== id) {
        return NextResponse.json({ error: '只能更新自己的旅行社信息' }, { status: 403 })
      }

      const agency = await prisma.agency.update({
        where: { id },
        data: {
          name,
          contactEmail,
          contactPhone,
          address
        }
      })

      return NextResponse.json(agency)
    }

    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  } catch (error) {
    console.error('Update agency error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 删除旅行社（仅平台超级管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload || payload.role !== 'platform_super_admin') {
      return NextResponse.json({ error: '只有平台超级管理员才能删除旅行社' }, { status: 403 })
    }

    const { id } = await params

    // 检查是否有依赖数据
    const hasDependencies = await prisma.$transaction([
      prisma.user.count({ where: { agencyId: id } }),
      prisma.tour.count({ where: { agencyId: id } }),
      prisma.itinerary.count({ where: { agencyId: id } }),
      prisma.vehicle.count({ where: { agencyId: id } })
    ])

    if (hasDependencies.some(count => count > 0)) {
      return NextResponse.json(
        { error: '该旅行社下还有数据，无法删除' },
        { status: 400 }
      )
    }

    await prisma.agency.delete({
      where: { id }
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('Delete agency error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

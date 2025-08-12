import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取旅行社列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 平台超级管理员可以查看所有旅行社
    if (payload.role === 'platform_super_admin') {
      const agencies = await prisma.agency.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(agencies)
    }

    // 旅行社管理员只能查看自己的旅行社
    if (payload.role === 'agency_admin') {
      const agency = await prisma.agency.findUnique({
        where: { id: payload.agencyId }
      })
      return NextResponse.json([agency])
    }

    return NextResponse.json({ error: '权限不足' }, { status: 403 })
  } catch (error) {
    console.error('Get agencies error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 创建新旅行社（仅平台超级管理员）
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload || payload.role !== 'platform_super_admin') {
      return NextResponse.json({ error: '只有平台超级管理员才能创建新旅行社' }, { status: 403 })
    }

    const { name, contactEmail, contactPhone, address } = await request.json()

    if (!name || !contactEmail || !contactPhone || !address) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      )
    }

    const agency = await prisma.agency.create({
      data: {
        name,
        contactEmail,
        contactPhone,
        address,
        platformAdminId: payload.userId,
        isActive: true
      }
    })

    return NextResponse.json(agency, { status: 201 })
  } catch (error) {
    console.error('Create agency error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
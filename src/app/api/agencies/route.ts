import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取所有旅行社（仅平台超级管理员）
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload || payload.role !== 'platform_super_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const agencies = await prisma.agency.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(agencies)
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
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
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
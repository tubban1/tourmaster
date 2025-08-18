import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 获取旅行社信息
    let agency = null
    if (payload.agencyId) {
      agency = await prisma.agency.findUnique({
        where: { id: payload.agencyId },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          isActive: true
        }
      })
    }

    return NextResponse.json({
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      agencyId: payload.agencyId,
      agency
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
} 
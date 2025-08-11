import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    return NextResponse.json({
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      agencyId: payload.agencyId
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
} 
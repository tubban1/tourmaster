import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 只有旅行社管理员可以绑定导游账号
    if (payload.role !== 'agency_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: '用户名不能为空' }, { status: 400 })
    }

    // 查找要绑定的用户
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查用户是否已被其他导游绑定
    const existingBinding = await prisma.agencyGuideAssignment.findFirst({
      where: { userId: user.id }
    })

    if (existingBinding) {
      return NextResponse.json({ error: '该用户已被其他导游绑定' }, { status: 400 })
    }

    // 创建导游基本信息
    const newGuide = await prisma.tourGuide.create({
      data: {
        name: username, // 临时使用username作为姓名，导游登录后可修改
        gender: 'unknown',
        email: user.email,
        contactPhone: '',
        languages: [],
        specialties: [],
        rating: 0,
        occupiedDates: [],
        notes: '导游登录后可完善信息',
        isActive: true
      }
    })

    // 创建导游-旅行社关系并绑定用户账号
    const assignment = await prisma.agencyGuideAssignment.create({
      data: {
        agencyId: payload.agencyId,
        guideId: newGuide.id,
        userId: user.id,
        agencySpecificEmployeeId: `EMP_${Date.now()}`, // 临时员工ID
        agencySpecificContractType: 'freelance',
        agencySpecificBaseSalary: 0,
        isActiveInAgency: true
      }
    })

    return NextResponse.json({
      message: '导游账号绑定成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      guide: {
        id: newGuide.id,
        name: newGuide.name
      },
      assignment: {
        id: assignment.id
      }
    })
  } catch (error) {
    console.error('Bind existing user error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 })
    }

    // 只有旅行社管理员可以创建导游账号
    if (payload.role !== 'agency_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: '用户名、邮箱和密码不能为空' }, { status: 400 })
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 400 })
    }

    // 邮箱可以重复，用于恢复账号，不检查重复

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户账号
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role: 'guide',
        agencyId: payload.agencyId,
        isActive: true
      }
    })

    // 创建导游基本信息
    const newGuide = await prisma.tourGuide.create({
      data: {
        name: username, // 临时使用username作为姓名，导游登录后可修改
        gender: 'unknown',
        email: email,
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
        userId: newUser.id,
        agencySpecificEmployeeId: `EMP_${Date.now()}`, // 临时员工ID
        agencySpecificContractType: 'freelance',
        agencySpecificBaseSalary: 0,
        isActiveInAgency: true
      }
    })

    return NextResponse.json({
      message: '导游账号创建成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
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
    console.error('Create guide with user error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
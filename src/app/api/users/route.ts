import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs';

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 只有平台超级管理员可以查看所有用户
    if (payload.role !== 'platform_super_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      include: {
        agency: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 })
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }
    // 只有平台超级管理员可以创建用户
    if (payload.role !== 'platform_super_admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }
    const {
      username,
      email,
      password,
      role,
      agencyId: inputAgencyId
    } = await request.json()
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }
    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findFirst({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已存在' },
        { status: 400 }
      )
    }
    let agencyId = inputAgencyId;
    // 如果是agency_admin且未传agencyId，则自动创建默认旅行社
    if (role === 'agency_admin' && !agencyId) {
      const now = new Date();
      const defaultAgency = await prisma.agency.create({
        data: {
          name: `新旅行社-${username}-${now.getTime()}`,
          contactEmail: email,
          contactPhone: '',
          address: '',
          isActive: true,
          platformAdminId: payload.id
        }
      });
      agencyId = defaultAgency.id;
    }
    // 其他角色未传agencyId，仍用第一个agency
    if (!agencyId) {
      const fallbackAgency = await prisma.agency.findFirst({ orderBy: { createdAt: 'asc' } });
      if (!fallbackAgency) {
        return NextResponse.json({ error: '请先创建旅行社' }, { status: 400 })
      }
      agencyId = fallbackAgency.id;
    }
    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        agencyId
      },
      include: { agency: true }
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
  }
} 
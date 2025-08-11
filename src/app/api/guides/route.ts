import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取导游列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const statusFilter = searchParams.get('status')

    let guides

    if (payload.role === 'platform_super_admin') {
      // 平台超级管理员可以看到所有导游
      guides = await prisma.tourGuide.findMany({
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { contactPhone: { contains: search, mode: 'insensitive' } }
            ]
          }),
          ...(statusFilter && statusFilter !== 'all' && {
            isActive: statusFilter === 'active'
          })
        },
        include: {
          agencyAssignments: {
            include: {
              agency: {
                select: { name: true }
              },
              user: {
                select: { username: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // 旅行社用户只能看到自己旅行社的导游
      guides = await prisma.tourGuide.findMany({
        where: {
          agencyAssignments: {
            some: {
              agencyId: payload.agencyId
            }
          },
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { contactPhone: { contains: search, mode: 'insensitive' } }
            ]
          }),
          ...(statusFilter && statusFilter !== 'all' && {
            isActive: statusFilter === 'active'
          })
        },
        include: {
          agencyAssignments: {
            where: {
              agencyId: payload.agencyId
            },
            include: {
              agency: {
                select: { name: true }
              },
              user: {
                select: { username: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(guides)
  } catch (error) {
    console.error('获取导游列表失败:', error)
    return NextResponse.json({ error: '获取导游列表失败' }, { status: 500 })
  }
}

// 创建新导游
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查权限
    const allowedRoles = ['agency_admin', 'sales']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const {
      name,
      gender,
      contactPhone,
      email,
      languages,
      specialties,
      rating,
      notes
    } = await request.json()

    if (!name || !gender || !contactPhone || !email || !languages || !specialties || rating === undefined) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const guide = await prisma.tourGuide.create({
      data: {
        name,
        gender,
        contactPhone,
        email,
        languages,
        specialties,
        rating,
        notes,
        isActive: true
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

    // 创建旅行社分配关系
    await prisma.agencyGuideAssignment.create({
      data: {
        agencyId: payload.agencyId,
        guideId: guide.id
      }
    })

    return NextResponse.json(guide, { status: 201 })
  } catch (error) {
    console.error('创建导游失败:', error)
    return NextResponse.json({ error: '创建导游失败' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取车辆列表
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const statusFilter = searchParams.get('status')

    let vehicles

    if (payload.role === 'platform_super_admin') {
      // 平台超级管理员可以看到所有车辆
      vehicles = await prisma.vehicle.findMany({
        where: {
          ...(search && {
            OR: [
              { plateNumber: { contains: search, mode: 'insensitive' } },
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } }
            ]
          }),
          ...(statusFilter && statusFilter !== 'all' && {
            isActive: statusFilter === 'active'
          })
        },
        include: {
          agency: true
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // 旅行社用户只能看到自己旅行社的车辆
      vehicles = await prisma.vehicle.findMany({
        where: {
          agencyId: payload.agencyId,
          ...(search && {
            OR: [
              { plateNumber: { contains: search, mode: 'insensitive' } },
              { make: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } }
            ]
          }),
          ...(statusFilter && statusFilter !== 'all' && {
            isActive: statusFilter === 'active'
          })
        },
        include: {
          agency: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('获取车辆列表失败:', error)
    return NextResponse.json({ error: '获取车辆列表失败' }, { status: 500 })
  }
}

// 创建新车辆
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查权限
    const allowedRoles = ['agency_admin', 'scheduler']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const {
      plateNumber,
      make,
      model,
      year,
      type,
      capacity,
      fuelType,
      licenseRequired,
      insuranceInfo,
      registrationExpiry,
      occupations,
      notes
    } = await request.json()

    if (!plateNumber || !make || !model || !year || !type || !capacity) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber,
        make,
        model,
        year,
        type,
        capacity,
        fuelType,
        licenseRequired,
        insuranceInfo,
        registrationExpiry: registrationExpiry ? new Date(registrationExpiry) : null,
        occupations: occupations || [{"type":"使用"}],
        notes,
        isActive: true,
        agencyId: payload.agencyId
      },
      include: {
        agency: true
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('创建车辆失败:', error)
    return NextResponse.json({ error: '创建车辆失败' }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenFromRequest } from '@/lib/auth'

// 获取单个车辆详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        agency: true
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: '车辆不存在' }, { status: 404 })
    }

    // 检查权限：只能查看自己旅行社的车辆
    if (payload.role !== 'platform_super_admin' && vehicle.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('获取车辆详情失败:', error)
    return NextResponse.json({ error: '获取车辆详情失败' }, { status: 500 })
  }
}

// 更新车辆信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params

    // 检查权限
    const allowedRoles = ['agency_admin', 'scheduler']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查车辆是否存在
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: '车辆不存在' }, { status: 404 })
    }

    // 检查权限：只能编辑自己旅行社的车辆
    if (existingVehicle.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { make, model, plateNumber, year, capacity, type, notes, occupations } = await request.json()

    if (!plateNumber || !make || !model || !year || !type || !capacity) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 清洗 occupations：
    // - 去除待命/检测（不存储）
    // - 去除空 dates
    // - 确保为数组
    const sanitizedOccupations = Array.isArray(occupations)
      ? occupations
          .filter((occ: any) => occ && Array.isArray(occ.dates))
          .filter((occ: any) => occ.type !== '待命' && occ.type !== '检测')
          .map((occ: any) => ({ type: occ.type, dates: occ.dates }))
          .filter((occ: any) => occ.dates.length > 0)
      : []

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber,
        make,
        model,
        year,
        type,
        capacity,
        occupations: sanitizedOccupations,
        notes,
        isActive
      },
      include: {
        agency: true
      }
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('更新车辆失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

// 删除车辆
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await verifyTokenFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = await params

    // 检查权限
    const allowedRoles = ['agency_admin']
    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 检查车辆是否存在
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: '车辆不存在' }, { status: 404 })
    }

    // 检查权限：只能删除自己旅行社的车辆
    if (existingVehicle.agencyId !== payload.agencyId) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 删除车辆
    await prisma.vehicle.delete({
      where: { id }
    })

    return NextResponse.json({ message: '车辆删除成功' })
  } catch (error) {
    console.error('删除车辆失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
} 
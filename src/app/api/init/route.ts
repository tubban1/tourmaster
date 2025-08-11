import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经初始化
    const existingAgency = await prisma.agency.findFirst()
    if (existingAgency) {
      return NextResponse.json(
        { error: '数据库已经初始化过了' },
        { status: 400 }
      )
    }

    // 先创建一个临时旅行社用于超级管理员
    const tempAgency = await prisma.agency.create({
      data: {
        name: '临时旅行社',
        contactEmail: 'temp@temp.com',
        contactPhone: '+86 000 0000 0000',
        address: '临时地址',
        isActive: false,
        platformAdminId: 'temp'
      }
    })

    // 创建平台超级管理员
    const superAdmin = await prisma.user.create({
      data: {
        username: 'superadmin',
        passwordHash: await hashPassword('admin123'),
        email: 'superadmin@tourmaster.ch',
        role: 'platform_super_admin',
        agencyId: tempAgency.id,
        isActive: true
      }
    })

    // 创建示例旅行社
    const agency = await prisma.agency.create({
      data: {
        name: '环球旅行社',
        contactEmail: 'contact@globaltravel.com',
        contactPhone: '+86 138 0000 0000',
        address: '北京市朝阳区建国路88号',
        isActive: true,
        platformAdminId: superAdmin.id
      }
    })

    // 更新超级管理员的agencyId为真实旅行社
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { agencyId: agency.id }
    })

    // 删除临时旅行社
    await prisma.agency.delete({
      where: { id: tempAgency.id }
    })

    // 创建旅行社管理员
    const agencyAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash: await hashPassword('admin123'),
        email: 'admin@globaltravel.com',
        role: 'agency_admin',
        agencyId: agency.id,
        isActive: true
      }
    })

    // 创建销售经理
    const salesManager = await prisma.user.create({
      data: {
        username: 'sales',
        passwordHash: await hashPassword('sales123'),
        email: 'sales@globaltravel.com',
        role: 'sales',
        agencyId: agency.id,
        isActive: true
      }
    })

    // 创建调度员
    const scheduler = await prisma.user.create({
      data: {
        username: 'scheduler',
        passwordHash: await hashPassword('scheduler123'),
        email: 'scheduler@globaltravel.com',
        role: 'scheduler',
        agencyId: agency.id,
        isActive: true
      }
    })

    // 创建导游
    const guide1 = await prisma.tourGuide.create({
      data: {
        name: '李明',
        gender: 'male',
        contactPhone: '+86 139 0000 0001',
        email: 'liming@example.com',
        languages: ['中文', '英文'],
        specialties: ['文化游', '历史讲解'],
        rating: 4.8,
        occupiedDates: [],
        notes: '资深导游，擅长欧洲历史',
        isActive: true
      }
    })

    const guide2 = await prisma.tourGuide.create({
      data: {
        name: '王芳',
        gender: 'female',
        contactPhone: '+86 139 0000 0002',
        email: 'wangfang@example.com',
        languages: ['中文', '英文', '德语'],
        specialties: ['徒步', '摄影'],
        rating: 4.9,
        occupiedDates: [],
        notes: '专业摄影师，擅长户外活动',
        isActive: true
      }
    })

    // 关联导游到旅行社
    await prisma.agencyGuideAssignment.create({
      data: {
        agencyId: agency.id,
        guideId: guide1.id,
        agencySpecificEmployeeId: 'EMP001',
        agencySpecificContractType: 'full-time',
        agencySpecificBaseSalary: 8000.00,
        isActiveInAgency: true
      }
    })

    await prisma.agencyGuideAssignment.create({
      data: {
        agencyId: agency.id,
        guideId: guide2.id,
        agencySpecificEmployeeId: 'EMP002',
        agencySpecificContractType: 'part-time',
        agencySpecificBaseSalary: 6000.00,
        isActiveInAgency: true
      }
    })

    // 创建车辆
    const vehicle1 = await prisma.vehicle.create({
      data: {
        agencyId: agency.id,
        plateNumber: '京A12345',
        type: '大巴',
        make: 'Mercedes-Benz',
        model: 'Tourismo',
        capacity: 50,
        year: 2022,
        driverName: '张师傅',
        driverContact: '+86 139 0000 0003',
        maintenanceStatus: '正常',
        lastMaintenanceDate: new Date('2024-12-01'),
        nextMaintenanceDate: new Date('2025-06-01'),
        occupiedDates: [],
        notes: '配备Wi-Fi和舒适座椅',
        isActive: true
      }
    })

    const vehicle2 = await prisma.vehicle.create({
      data: {
        agencyId: agency.id,
        plateNumber: '京B67890',
        type: '商务车',
        make: 'Toyota',
        model: 'Alphard',
        capacity: 8,
        year: 2023,
        driverName: '李师傅',
        driverContact: '+86 139 0000 0004',
        maintenanceStatus: '正常',
        lastMaintenanceDate: new Date('2024-11-15'),
        nextMaintenanceDate: new Date('2025-05-15'),
        occupiedDates: [],
        notes: '豪华商务车，适合小团',
        isActive: true
      }
    })

    // 创建行程模板
    const itinerary = await prisma.itinerary.create({
      data: {
        agencyId: agency.id,
        name: '瑞士深度探索之旅 - 7日',
        description: '探索瑞士壮丽的山川湖泊和文化名城',
        durationDays: 7,
        destinations: ['苏黎世', '琉森', '因特拉肯', '采尔马特'],
        activities: [
          {
            day: 1,
            description: '抵达苏黎世，自由活动',
            hotelInfo: {
              name: 'Hotel XYZ Zurich',
              checkInTime: '15:00',
              checkOutTime: '12:00'
            }
          },
          {
            day: 2,
            description: '苏黎世市区游览，班霍夫大街购物',
            hotelInfo: {
              name: 'Hotel XYZ Zurich',
              checkInTime: '15:00',
              checkOutTime: '12:00'
            }
          }
        ],
        costEstimation: 5000.00,
        inclusion: ['交通', '住宿', '部分餐食', '景点门票'],
        exclusion: ['国际机票', '个人消费', '导游小费'],
        isActive: true,
        createdBy: agencyAdmin.id
      }
    })

    // 创建旅行团
    const tour = await prisma.tour.create({
      data: {
        agencyId: agency.id,
        name: '瑞士深度探索之旅 - 2025年3月团',
        itineraryId: itinerary.id,
        status: 'planned',
        maxCapacity: 20,
        currentMembersCount: 0,
        salesManagerId: salesManager.id,
        notes: '春季团，适合摄影爱好者',
        overallArrivalTime: new Date('2025-03-15T09:00:00Z'),
        overallDepartureTime: new Date('2025-03-21T18:00:00Z'),
        pickupSignInfo: '张经理（环球旅行社）',
        flightDetails: {
          outboundFlight: {
            flightNumber: 'LX188',
            airline: 'Swiss Air',
            departureAirport: 'PVG',
            arrivalAirport: 'ZRH',
            departureTime: '2025-03-14T23:55:00Z',
            arrivalTime: '2025-03-15T07:30:00Z'
          },
          returnFlight: {
            flightNumber: 'LX189',
            airline: 'Swiss Air',
            departureAirport: 'ZRH',
            arrivalAirport: 'PVG',
            departureTime: '2025-03-21T22:00:00Z',
            arrivalTime: '2025-03-22T15:00:00Z'
          }
        }
      }
    })

    // 更新行程的tourId
    await prisma.itinerary.update({
      where: { id: itinerary.id },
      data: { tourId: tour.id }
    })

    return NextResponse.json({
      message: '数据库初始化成功',
      testAccounts: {
        platform_super_admin: {
          username: 'superadmin',
          password: 'admin123',
          description: '平台超级管理员'
        },
        agency_admin: {
          username: 'admin',
          password: 'admin123',
          description: '旅行社管理员'
        },
        sales_manager: {
          username: 'sales',
          password: 'sales123',
          description: '销售经理'
        },
        scheduler: {
          username: 'scheduler',
          password: 'scheduler123',
          description: '调度员'
        }
      },
      createdData: {
        agency: agency.name,
        guides: [guide1.name, guide2.name],
        vehicles: [vehicle1.plateNumber, vehicle2.plateNumber],
        itinerary: itinerary.name,
        tour: tour.name
      }
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: '初始化失败: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建测试数据...')

  // 1. 创建旅行社
  const agency1 = await prisma.agency.create({
    data: {
      name: '瑞士环球旅行社',
      contactEmail: 'contact@swissglobal.com',
      contactPhone: '+41 44 123 4567',
      address: 'Bahnhofstrasse 1, 8001 Zürich, Switzerland',
      isActive: true,
      platformAdminId: 'platform_admin_001'
    }
  })

  const agency2 = await prisma.agency.create({
    data: {
      name: '阿尔卑斯旅游',
      contactEmail: 'info@alpine-travel.ch',
      contactPhone: '+41 31 987 6543',
      address: 'Bundesgasse 16, 3011 Bern, Switzerland',
      isActive: true,
      platformAdminId: 'platform_admin_001'
    }
  })

  console.log('✅ 旅行社创建完成')

  // 2. 创建用户
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 平台超级管理员
  const platformAdmin = await prisma.user.create({
    data: {
      agencyId: agency1.id,
      username: 'platform_admin',
      passwordHash: hashedPassword,
      email: 'admin@platform.com',
      role: 'platform_super_admin',
      isActive: true
    }
  })

  // 旅行社管理员
  const agencyAdmin1 = await prisma.user.create({
    data: {
      agencyId: agency1.id,
      username: 'agency_admin_1',
      passwordHash: hashedPassword,
      email: 'admin@swissglobal.com',
      role: 'agency_admin',
      isActive: true
    }
  })

  const agencyAdmin2 = await prisma.user.create({
    data: {
      agencyId: agency2.id,
      username: 'agency_admin_2',
      passwordHash: hashedPassword,
      email: 'admin@alpine-travel.ch',
      role: 'agency_admin',
      isActive: true
    }
  })

  // 销售经理
  const salesManager1 = await prisma.user.create({
    data: {
      agencyId: agency1.id,
      username: 'sales_manager_1',
      passwordHash: hashedPassword,
      email: 'sales@swissglobal.com',
      role: 'sales',
      isActive: true
    }
  })

  const salesManager2 = await prisma.user.create({
    data: {
      agencyId: agency2.id,
      username: 'sales_manager_2',
      passwordHash: hashedPassword,
      email: 'sales@alpine-travel.ch',
      role: 'sales',
      isActive: true
    }
  })

  // 调度员
  const scheduler1 = await prisma.user.create({
    data: {
      agencyId: agency1.id,
      username: 'scheduler_1',
      passwordHash: hashedPassword,
      email: 'scheduler@swissglobal.com',
      role: 'scheduler',
      isActive: true
    }
  })

  // 导游用户
  const guideUser1 = await prisma.user.create({
    data: {
      agencyId: agency1.id,
      username: 'guide_user_1',
      passwordHash: hashedPassword,
      email: 'guide1@swissglobal.com',
      role: 'guide',
      isActive: true
    }
  })

  const guideUser2 = await prisma.user.create({
    data: {
      agencyId: agency1.id,
      username: 'guide_user_2',
      passwordHash: hashedPassword,
      email: 'guide2@swissglobal.com',
      role: 'guide',
      isActive: true
    }
  })

  console.log('✅ 用户创建完成')

  // 3. 创建导游
  const guide1 = await prisma.tourGuide.create({
    data: {
      name: '李明',
      gender: 'male',
      contactPhone: '+41 79 123 4567',
      email: 'liming@example.com',
      languages: ['中文', '英文', '德语'],
      specialties: ['文化游', '徒步', '摄影'],
      rating: 4.8,
      occupiedDates: ['2025-07-01', '2025-07-02', '2025-07-03'],
      notes: '擅长欧洲历史，客户反馈极好。',
      isActive: true
    }
  })

  const guide2 = await prisma.tourGuide.create({
    data: {
      name: '安娜',
      gender: 'female',
      contactPhone: '+41 78 987 6543',
      email: 'anna@example.com',
      languages: ['德语', '英文', '法语'],
      specialties: ['滑雪', '美食', '购物'],
      rating: 4.9,
      occupiedDates: ['2025-07-05', '2025-07-06'],
      notes: '专业滑雪教练，熟悉瑞士各地美食。',
      isActive: true
    }
  })

  const guide3 = await prisma.tourGuide.create({
    data: {
      name: '王师傅',
      gender: 'male',
      contactPhone: '+41 76 555 1234',
      email: 'wang@example.com',
      languages: ['中文', '英文'],
      specialties: ['自驾游', '商务团'],
      rating: 4.7,
      occupiedDates: [],
      notes: '专业司机兼导游，熟悉瑞士路况。',
      isActive: true
    }
  })

  console.log('✅ 导游创建完成')

  // 4. 创建导游-旅行社关系
  await prisma.agencyGuideAssignment.create({
    data: {
      agencyId: agency1.id,
      guideId: guide1.id,
      userId: guideUser1.id,
      agencySpecificEmployeeId: 'EMP001',
      agencySpecificContractType: 'full-time',
      agencySpecificBaseSalary: 5000.00,
      isActiveInAgency: true
    }
  })

  await prisma.agencyGuideAssignment.create({
    data: {
      agencyId: agency1.id,
      guideId: guide2.id,
      userId: guideUser2.id,
      agencySpecificEmployeeId: 'EMP002',
      agencySpecificContractType: 'part-time',
      agencySpecificBaseSalary: 3000.00,
      isActiveInAgency: true
    }
  })

  await prisma.agencyGuideAssignment.create({
    data: {
      agencyId: agency2.id,
      guideId: guide3.id,
      userId: null, // 未绑定用户账号
      agencySpecificEmployeeId: 'EMP003',
      agencySpecificContractType: 'freelance',
      agencySpecificBaseSalary: 4000.00,
      isActiveInAgency: true
    }
  })

  console.log('✅ 导游-旅行社关系创建完成')

  // 5. 创建车辆
  const vehicle1 = await prisma.vehicle.create({
    data: {
      agencyId: agency1.id,
      plateNumber: 'NE 123 456',
      type: '大巴',
      make: 'Mercedes-Benz',
      model: 'Tourismo',
      capacity: 50,
      year: 2022,
      occupations: ['2025-07-02', '2025-07-03', '2025-07-04'],
      notes: '配备车载Wi-Fi和舒适座椅。',
      isActive: true
    }
  })

  const vehicle2 = await prisma.vehicle.create({
    data: {
      agencyId: agency1.id,
      plateNumber: 'BE 789 012',
      type: '商务车',
      make: 'Volkswagen',
      model: 'Crafter',
      capacity: 12,
      year: 2023,
      occupations: ['2025-07-01'],
      notes: '适合小团和商务团。',
      isActive: true
    }
  })

  const vehicle3 = await prisma.vehicle.create({
    data: {
      agencyId: agency2.id,
      plateNumber: 'ZH 456 789',
      type: '轿车',
      make: 'BMW',
      model: 'X5',
      capacity: 5,
      year: 2024,
      occupations: [],
      notes: '豪华轿车，适合VIP团。',
      isActive: true
    }
  })

  console.log('✅ 车辆创建完成')

  // 6. 创建行程
  const itinerary1 = await prisma.itinerary.create({
    data: {
      agencyId: agency1.id,
      name: '瑞士深度探索之旅 - 7日',
      description: '探索瑞士壮丽的山川湖泊和文化名城。',
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
          },
          guides: [
            {
              guideId: guide1.id,
              vehicleId: vehicle1.id
            }
          ]
        },
        {
          day: 2,
          description: '苏黎世市区游览，班霍夫大街购物',
          hotelInfo: {
            name: 'Hotel XYZ Zurich',
            checkInTime: '15:00',
            checkOutTime: '12:00'
          },
          guides: [
            {
              guideId: guide1.id,
              vehicleId: null
            }
          ]
        }
      ],
      costEstimation: 5000.00,
      inclusion: ['交通', '住宿', '部分餐食', '景点门票'],
      exclusion: ['国际机票', '个人消费', '导游小费'],
      isActive: true,
      createdBy: agencyAdmin1.id
    }
  })

  const itinerary2 = await prisma.itinerary.create({
    data: {
      agencyId: agency2.id,
      name: '阿尔卑斯滑雪之旅 - 5日',
      description: '体验瑞士顶级滑雪场和阿尔卑斯风光。',
      durationDays: 5,
      destinations: ['采尔马特', '圣莫里茨', '达沃斯'],
      activities: [
        {
          day: 1,
          description: '抵达采尔马特，滑雪装备租赁',
          hotelInfo: {
            name: 'Hotel ABC Zermatt',
            checkInTime: '15:00',
            checkOutTime: '12:00'
          },
          guides: [
            {
              guideId: guide2.id,
              vehicleId: null
            }
          ]
        }
      ],
      costEstimation: 3500.00,
      inclusion: ['住宿', '滑雪装备', '缆车票'],
      exclusion: ['国际机票', '个人消费', '餐饮'],
      isActive: true,
      createdBy: agencyAdmin2.id
    }
  })

  console.log('✅ 行程创建完成')

  // 7. 创建旅行团
  const tour1 = await prisma.tour.create({
    data: {
      agencyId: agency1.id,
      name: '瑞士深度探索之旅 - 2025年7月团',
      itineraryId: itinerary1.id,
      status: 'planned',
      maxCapacity: 20,
      currentMembersCount: 15,
      salesManagerId: salesManager1.id,
      actualCost: null,
      actualRevenue: null,
      notes: '此团有老年团员，行程安排需平缓。',
      overallArrivalTime: new Date('2025-07-15T09:00:00Z'),
      overallDepartureTime: new Date('2025-07-21T18:00:00Z'),
      pickupSignInfo: '张三（瑞士环球旅行社）',
      flightDetails: {
        outboundFlight: {
          flightNumber: 'LX188',
          airline: 'Swiss Air',
          departureAirport: 'PVG',
          arrivalAirport: 'ZRH',
          departureTime: '2025-07-14T23:55:00Z',
          arrivalTime: '2025-07-15T07:30:00Z'
        },
        returnFlight: {
          flightNumber: 'LX189',
          airline: 'Swiss Air',
          departureAirport: 'ZRH',
          arrivalAirport: 'PVG',
          departureTime: '2025-07-21T22:00:00Z',
          arrivalTime: '2025-07-22T15:00:00Z'
        }
      }
    }
  })

  const tour2 = await prisma.tour.create({
    data: {
      agencyId: agency2.id,
      name: '阿尔卑斯滑雪之旅 - 2025年1月团',
      itineraryId: itinerary2.id,
      status: 'paid',
      maxCapacity: 12,
      currentMembersCount: 8,
      salesManagerId: salesManager2.id,
      actualCost: 2800.00,
      actualRevenue: 3200.00,
      notes: '滑雪爱好者团，需要专业指导。',
      overallArrivalTime: new Date('2025-01-15T10:00:00Z'),
      overallDepartureTime: new Date('2025-01-19T16:00:00Z'),
      pickupSignInfo: '李四（阿尔卑斯旅游）',
      flightDetails: {
        outboundFlight: {
          flightNumber: 'LX190',
          airline: 'Swiss Air',
          departureAirport: 'PEK',
          arrivalAirport: 'ZRH',
          departureTime: '2025-01-14T20:00:00Z',
          arrivalTime: '2025-01-15T06:30:00Z'
        },
        returnFlight: {
          flightNumber: 'LX191',
          airline: 'Swiss Air',
          departureAirport: 'ZRH',
          arrivalAirport: 'PEK',
          departureTime: '2025-01-19T18:00:00Z',
          arrivalTime: '2025-01-20T10:00:00Z'
        }
      }
    }
  })

  console.log('✅ 旅行团创建完成')

  // 8. 创建团员
  await prisma.tourMember.create({
    data: {
      tourId: tour1.id,
      firstName: '张',
      lastName: '三',
      gender: 'male',
      dateOfBirth: new Date('1980-05-20'),
      passportNumber: 'E12345678',
      contactEmail: 'zhangsan@example.com',
      contactPhone: '+86 138 0013 8000',
      emergencyContactName: '李四',
      emergencyContactPhone: '+86 139 0013 9000',
      healthNotes: '对海鲜过敏',
      dietaryRestrictions: '素食'
    }
  })

  await prisma.tourMember.create({
    data: {
      tourId: tour1.id,
      firstName: '王',
      lastName: '五',
      gender: 'female',
      dateOfBirth: new Date('1985-08-15'),
      passportNumber: 'E87654321',
      contactEmail: 'wangwu@example.com',
      contactPhone: '+86 137 0013 7000',
      emergencyContactName: '赵六',
      emergencyContactPhone: '+86 136 0013 6000',
      healthNotes: null,
      dietaryRestrictions: null
    }
  })

  await prisma.tourMember.create({
    data: {
      tourId: tour2.id,
      firstName: '陈',
      lastName: '七',
      gender: 'male',
      dateOfBirth: new Date('1990-12-03'),
      passportNumber: 'E11111111',
      contactEmail: 'chenqi@example.com',
      contactPhone: '+86 135 0013 5000',
      emergencyContactName: '孙八',
      emergencyContactPhone: '+86 134 0013 4000',
      healthNotes: '高血压，需要定期服药',
      dietaryRestrictions: '低盐饮食'
    }
  })

  console.log('✅ 团员创建完成')

  // 9. 创建供应商
  const supplier1 = await prisma.supplier.create({
    data: {
      agencyId: agency1.id,
      name: 'Alpine Hotels Group',
      type: '酒店',
      contactPerson: 'Anna Müller',
      contactEmail: 'anna@alpinehotels.com',
      contactPhone: '+41 44 123 4567',
      address: 'Main Street 1, Zurich, Switzerland',
      serviceOfferings: ['住宿', '餐饮'],
      notes: '长期合作供应商，提供折扣。',
      isActive: true
    }
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      agencyId: agency2.id,
      name: 'Swiss Ski Equipment',
      type: '装备租赁',
      contactPerson: 'Hans Weber',
      contactEmail: 'hans@swissski.com',
      contactPhone: '+41 31 987 6543',
      address: 'Ski Street 5, Zermatt, Switzerland',
      serviceOfferings: ['滑雪装备', '安全设备'],
      notes: '专业滑雪装备租赁，提供培训。',
      isActive: true
    }
  })

  console.log('✅ 供应商创建完成')

  // 10. 创建服务预订
  await prisma.serviceReservation.create({
    data: {
      tourId: tour1.id,
      supplierId: supplier1.id,
      serviceType: '酒店住宿',
      description: 'Hotel A, 3晚，共15人',
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-18'),
      quantity: 15,
      unitPrice: 100.00,
      totalCost: 3000.00,
      status: 'confirmed',
      confirmationNumber: 'HGH789ABC',
      bookedBy: salesManager1.id
    }
  })

  await prisma.serviceReservation.create({
    data: {
      tourId: tour2.id,
      supplierId: supplier2.id,
      serviceType: '装备租赁',
      description: '滑雪装备租赁，8人，5天',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-19'),
      quantity: 8,
      unitPrice: 50.00,
      totalCost: 400.00,
      status: 'confirmed',
      confirmationNumber: 'SKI123DEF',
      bookedBy: salesManager2.id
    }
  })

  console.log('✅ 服务预订创建完成')

  console.log('🎉 所有测试数据创建完成！')
  console.log('\n📊 数据统计:')
  console.log(`- 旅行社: 2个`)
  console.log(`- 用户: 8个 (包含不同角色)`)
  console.log(`- 导游: 3个`)
  console.log(`- 车辆: 3辆`)
  console.log(`- 行程: 2个`)
  console.log(`- 旅行团: 2个`)
  console.log(`- 团员: 3个`)
  console.log(`- 供应商: 2个`)
  console.log(`- 服务预订: 2个`)

  console.log('\n🔑 测试账号:')
  console.log('平台超级管理员: platform_admin / password123')
  console.log('旅行社管理员1: agency_admin_1 / password123')
  console.log('旅行社管理员2: agency_admin_2 / password123')
  console.log('销售经理1: sales_manager_1 / password123')
  console.log('销售经理2: sales_manager_2 / password123')
  console.log('调度员: scheduler_1 / password123')
  console.log('导游用户1: guide_user_1 / password123')
  console.log('导游用户2: guide_user_2 / password123')
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
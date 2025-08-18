const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('开始创建数据...')

    // 1. 创建旅行社
    console.log('创建旅行社...')
    const agency = await prisma.agency.create({
      data: {
        name: 'ReallyLife 旅行社',
        contactEmail: 'admin@reallylife.com',
        contactPhone: '13800138000',
        address: '北京市朝阳区某某街道123号',
        isActive: true,
        platformAdminId: 'system' // 临时值，实际应该是真实的平台管理员ID
      }
    })
    console.log('旅行社创建成功:', agency)

    // 2. 创建用户
    console.log('创建用户...')
    const passwordHash = await bcrypt.hash('reallylife2025', 12)
    const user = await prisma.user.create({
      data: {
        username: 'reallylife',
        passwordHash: passwordHash,
        email: 'reallylife@example.com',
        role: 'agency_admin',
        agencyId: agency.id,
        isActive: true
      }
    })
    console.log('用户创建成功:', user)

    console.log('所有数据创建完成！')
    console.log('旅行社ID:', agency.id)
    console.log('用户ID:', user.id)
    console.log('用户名: reallylife')
    console.log('密码: reallylife2025')

  } catch (error) {
    console.error('创建数据时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateVehicleOccupations() {
  try {
    console.log('开始迁移车辆occupations数据结构...')
    
    // 获取所有车辆
    const vehicles = await prisma.vehicle.findMany()
    console.log(`找到 ${vehicles.length} 辆车辆`)
    
    let migratedCount = 0
    
    for (const vehicle of vehicles) {
      try {
        let newOccupations = []
        
        // 检查现有的occupations字段
        if (vehicle.occupations && Array.isArray(vehicle.occupations)) {
          // 如果已经是新格式，跳过
          if (vehicle.occupations.length > 0 && vehicle.occupations[0].dates) {
            console.log(`车辆 ${vehicle.plateNumber} 已经是新格式，跳过`)
            continue
          }
          
          // 转换旧格式到新格式
          newOccupations = vehicle.occupations.map(occ => {
            if (occ.startDate && occ.endDate) {
              // 旧格式：有startDate和endDate
              const start = new Date(occ.startDate)
              const end = new Date(occ.endDate)
              const dates = []
              
              // 生成日期范围内的所有日期
              const current = new Date(start)
              while (current <= end) {
                dates.push(current.toISOString().split('T')[0])
                current.setDate(current.getDate() + 1)
              }
              
              return {
                type: occ.type || '待命',
                dates: dates
              }
            } else {
              // 旧格式：只有type，没有日期
              return {
                type: occ.type || '待命',
                dates: []
              }
            }
          })
        } else {
          // 如果没有occupations字段，设置默认值
          newOccupations = [{
            type: '待命',
            dates: []
          }]
        }
        
        // 更新车辆数据
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: {
            occupations: newOccupations
          }
        })
        
        console.log(`车辆 ${vehicle.plateNumber} 迁移成功`)
        migratedCount++
        
      } catch (error) {
        console.error(`车辆 ${vehicle.plateNumber} 迁移失败:`, error)
      }
    }
    
    console.log(`迁移完成！成功迁移 ${migratedCount} 辆车辆`)
    
  } catch (error) {
    console.error('迁移过程中发生错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行迁移
migrateVehicleOccupations()
  .catch(console.error)
  .finally(() => process.exit(0)) 
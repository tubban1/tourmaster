// 测试排班管理API的脚本
// 使用方法：node test-scheduling.js

const BASE_URL = 'http://localhost:3000'

// 模拟测试数据
const testData = {
  tourId: 'test-tour-id',
  startDate: '2024-01-01',
  endDate: '2024-01-05',
  dailyAssignments: [
    {
      date: '2024-01-01',
      guides: [
        { id: 'guide-1', name: '导游A' }
      ],
      vehicle: { id: 'vehicle-1', plateNumber: '京A12345' },
      accommodation: '酒店A',
      notes: '第一天安排'
    },
    {
      date: '2024-01-02',
      guides: [
        { id: 'guide-1', name: '导游A' }
      ],
      vehicle: { id: 'vehicle-1', plateNumber: '京A12345' },
      accommodation: '酒店B',
      notes: '第二天安排'
    }
  ]
}

// 测试获取排班信息
async function testGetScheduling() {
  try {
    console.log('测试获取排班信息...')
    const response = await fetch(
      `${BASE_URL}/api/scheduling/tour/${testData.tourId}?startDate=${testData.startDate}&endDate=${testData.endDate}`
    )
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 获取排班信息成功:', data)
    } else {
      const error = await response.json()
      console.log('❌ 获取排班信息失败:', error)
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }
}

// 测试保存排班安排
async function testSaveScheduling() {
  try {
    console.log('测试保存排班安排...')
    const response = await fetch(`${BASE_URL}/api/scheduling/tour/${testData.tourId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 保存排班安排成功:', data)
    } else {
      const error = await response.json()
      console.log('❌ 保存排班安排失败:', error)
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }
}

// 测试检查可用性
async function testCheckAvailability() {
  try {
    console.log('测试检查可用性...')
    const response = await fetch(`${BASE_URL}/api/scheduling/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tourId: testData.tourId,
        dates: [testData.startDate, testData.endDate],
        guideIds: ['guide-1'],
        vehicleIds: ['vehicle-1']
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 检查可用性成功:', data)
    } else {
      const error = await response.json()
      console.log('❌ 检查可用性失败:', error)
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始测试排班管理API...\n')
  
  await testGetScheduling()
  console.log('')
  
  await testCheckAvailability()
  console.log('')
  
  await testSaveScheduling()
  console.log('')
  
  console.log('✨ 测试完成！')
}

// 如果直接运行此脚本，则执行测试
if (require.main === module) {
  runTests()
}

module.exports = {
  testGetScheduling,
  testSaveScheduling,
  testCheckAvailability,
  runTests
} 
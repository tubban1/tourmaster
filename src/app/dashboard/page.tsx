'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

interface User {
  id: string
  username: string
  email: string
  role: string
  agencyId: string
  agency?: {
    name: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 这里应该从API获取用户信息
    // 暂时使用模拟数据
    setUser({
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'agency_admin',
      agencyId: '1',
      agency: { name: '示例旅行社' }
    })
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">请先登录</div>
      </div>
    )
  }

  const menuItems = [
    {
      title: '旅行团管理',
      description: '管理旅行团信息',
      href: '/tours',
      icon: '🚌'
    },
    {
      title: '行程管理',
      description: '管理行程模板',
      href: '/itineraries',
      icon: '🗺️'
    },
    {
      title: '团员管理',
      description: '管理团员信息',
      href: '/members',
      icon: '👥'
    },
    {
      title: '导游管理',
      description: '管理导游资源',
      href: '/guides',
      icon: '👨‍🏫'
    },
    {
      title: '车辆管理',
      description: '管理车辆资源',
      href: '/vehicles',
      icon: '🚗'
    },
    {
      title: '排班管理',
      description: '管理资源排班',
      href: '/scheduling',
      icon: '📅'
    },
    {
      title: '供应商管理',
      description: '管理供应商信息',
      href: '/suppliers',
      icon: '🏢'
    }
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来，{user.username}
          </h1>
          <p className="text-gray-600">
            您正在管理 {user.agency?.name} 的旅行社业务
          </p>
        </div>

        {/* 快速导航 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">快速导航</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block group"
                >
                  <div className="bg-gray-50 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="text-3xl">{item.icon}</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 系统状态 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">系统状态</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">系统运行状态</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">数据库连接</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API服务</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">快捷操作</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Link
                href="/tours/new"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
              >
                创建旅行团
              </Link>
              <Link
                href="/itineraries/new"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center block"
              >
                创建行程
              </Link>
              <Link
                href="/members/new"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center block"
              >
                添加团员
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 
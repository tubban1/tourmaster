'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

interface SidebarProps {
  user?: User | null
}

export default function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      title: '仪表板',
      href: '/dashboard',
      icon: '📊',
      description: '系统概览'
    },
    {
      title: '旅行团管理',
      href: '/tours',
      icon: '🚌',
      description: '管理旅行团信息'
    },
    {
      title: '行程管理',
      href: '/itineraries',
      icon: '🗺️',
      description: '管理行程模板'
    },
    {
      title: '团员管理',
      href: '/members',
      icon: '👥',
      description: '管理团员信息'
    },
    {
      title: '导游管理',
      href: '/guides',
      icon: '👨‍🏫',
      description: '管理导游资源'
    },
    {
      title: '车辆管理',
      href: '/vehicles',
      icon: '🚗',
      description: '管理车辆资源'
    },
    {
      title: '排班管理',
      href: '/scheduling',
      icon: '📅',
      description: '管理资源排班'
    },
    {
      title: '供应商管理',
      href: '/suppliers',
      icon: '🏢',
      description: '管理供应商信息'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <h1 className="text-xl font-bold text-gray-900">TourMaster</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
            title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block p-3 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isCollapsed ? item.title : undefined}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </nav>

      {/* User Info */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.agency?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/'
                }}
                className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                登出
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/'
                }}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                title="登出"
              >
                🚪
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
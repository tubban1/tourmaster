'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

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

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 
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
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // 如果获取用户信息失败，使用默认数据
          setUser({
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'agency_admin',
            agencyId: '1',
            agency: { name: '加载中...' }
          })
        }
      } catch (error) {
        console.error('获取用户信息错误:', error)
        // 使用默认数据
        setUser({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'agency_admin',
          agencyId: '1',
          agency: { name: '加载中...' }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
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
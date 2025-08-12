import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
  role: string
  agencyId: string
  agency?: {
    id: string
    name: string
    contactEmail: string
    contactPhone: string
    address: string
    isActive: boolean
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setError(null)
        } else {
          setError('获取用户信息失败')
          setUser({
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'agency_admin',
            agencyId: '1',
            agency: { 
              id: '1',
              name: '加载中...',
              contactEmail: '',
              contactPhone: '',
              address: '',
              isActive: true
            }
          })
        }
      } catch (error) {
        console.error('获取用户信息错误:', error)
        setError('网络错误')
        setUser({
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'agency_admin',
          agencyId: '1',
          agency: { 
            id: '1',
            name: '加载中...',
            contactEmail: '',
            contactPhone: '',
            address: '',
            isActive: true
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  return { user, loading, error }
}

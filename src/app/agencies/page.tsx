'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'

interface Agency {
  id: string
  name: string
  contactEmail: string
  contactPhone: string
  address: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [userAgencyId, setUserAgencyId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  })

  useEffect(() => {
    fetchUserInfo()
    fetchAgencies()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUserRole(userData.role)
        setUserAgencyId(userData.agencyId)
      }
    } catch (error) {
      console.error('获取用户信息错误:', error)
    }
  }

  const fetchAgencies = async () => {
    try {
      const response = await fetch('/api/agencies')
      if (response.ok) {
        const data = await response.json()
        setAgencies(data)
      } else {
        console.error('获取旅行社列表失败')
      }
    } catch (error) {
      console.error('获取旅行社列表错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingAgency 
        ? `/api/agencies/${editingAgency.id}` 
        : '/api/agencies'
      
      const method = editingAgency ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowCreateForm(false)
        setEditingAgency(null)
        setFormData({ name: '', contactEmail: '', contactPhone: '', address: '' })
        fetchAgencies()
      } else {
        const error = await response.json()
        alert(error.error || '操作失败')
      }
    } catch (error) {
      console.error('操作错误:', error)
      alert('操作失败')
    }
  }

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency)
    setFormData({
      name: agency.name,
      contactEmail: agency.contactEmail,
      contactPhone: agency.contactPhone,
      address: agency.address
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个旅行社吗？')) return
    
    try {
      const response = await fetch(`/api/agencies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAgencies()
      } else {
        const error = await response.json()
        alert(error.error || '删除失败')
      }
    } catch (error) {
      console.error('删除错误:', error)
      alert('删除失败')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', contactEmail: '', contactPhone: '', address: '' })
    setEditingAgency(null)
    setShowCreateForm(false)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">旅行社管理</h1>
          {userRole === 'platform_super_admin' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              添加旅行社
            </button>
          )}
        </div>

        {/* 权限说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-lg">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">权限说明：</p>
              {userRole === 'platform_super_admin' ? (
                <p>您是平台超级管理员，可以管理所有旅行社信息，包括创建、编辑和删除。</p>
              ) : userRole === 'agency_admin' ? (
                <p>您是旅行社管理员，只能查看和编辑自己旅行社的信息。</p>
              ) : (
                <p>您没有访问此页面的权限。</p>
              )}
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingAgency ? '编辑旅行社' : '添加旅行社'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    旅行社名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系邮箱 *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    联系电话 *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地址 *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingAgency ? '更新' : '创建'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">旅行社列表</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    旅行社名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系邮箱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系电话
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agency.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agency.contactEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agency.contactPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agency.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        agency.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {agency.isActive ? '活跃' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {(userRole === 'platform_super_admin' || 
                        (userRole === 'agency_admin' && userAgencyId === agency.id)) && (
                        <button
                          onClick={() => handleEdit(agency)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          编辑
                        </button>
                      )}
                      {userRole === 'platform_super_admin' && (
                        <button
                          onClick={() => handleDelete(agency.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

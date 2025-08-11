'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

interface TourMember {
  id: string
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  passportNumber: string
  contactEmail: string
  contactPhone: string
  emergencyContactName: string
  emergencyContactPhone: string
  healthNotes?: string
  dietaryRestrictions?: string
  createdAt: string
  tour: {
    id: string
    name: string
    status: string
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<TourMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<TourMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [tourFilter, setTourFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, genderFilter, tourFilter, ageFilter])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members')
      if (!response.ok) {
        throw new Error('获取团员列表失败')
      }
      const data = await response.json()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = [...members]

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(member => 
        member.firstName.toLowerCase().includes(term) ||
        member.lastName.toLowerCase().includes(term) ||
        member.passportNumber.toLowerCase().includes(term) ||
        member.contactPhone.includes(term) ||
        member.tour.name.toLowerCase().includes(term)
      )
    }

    // 性别过滤
    if (genderFilter !== 'all') {
      filtered = filtered.filter(member => member.gender === genderFilter)
    }

    // 旅行团过滤
    if (tourFilter !== 'all') {
      filtered = filtered.filter(member => member.tour.id === tourFilter)
    }

    // 年龄过滤
    if (ageFilter !== 'all') {
      filtered = filtered.filter(member => {
        const age = calculateAge(member.dateOfBirth)
        switch (ageFilter) {
          case 'child':
            return age < 18
          case 'adult':
            return age >= 18 && age < 65
          case 'senior':
            return age >= 65
          default:
            return true
        }
      })
    }

    setFilteredMembers(filtered)
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male':
        return '男'
      case 'female':
        return '女'
      case 'other':
        return '其他'
      default:
        return gender
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned':
        return '计划中'
      case 'paid':
        return '已付款'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              团员管理
            </h1>
            <p className="text-gray-600">
              管理所有团员信息
            </p>
          </div>
          <Link
            href="/members/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            添加团员
          </Link>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 搜索框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <input
                type="text"
                placeholder="搜索姓名、护照号、电话..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 性别筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* 旅行团筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                旅行团
              </label>
              <select
                value={tourFilter}
                onChange={(e) => setTourFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部旅行团</option>
                {Array.from(new Set(members.map(m => m.tour.id))).map(tourId => {
                  const tour = members.find(m => m.tour.id === tourId)?.tour
                  return (
                    <option key={tourId} value={tourId}>
                      {tour?.name}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* 年龄筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年龄
              </label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">全部年龄</option>
                <option value="child">儿童 (&lt;18岁)</option>
                <option value="adult">成人 (18-64岁)</option>
                <option value="senior">老年 (≥65岁)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 团员列表 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              团员列表 ({filteredMembers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    性别
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年龄
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    护照号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系电话
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    旅行团
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getGenderText(member.gender)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateAge(member.dateOfBirth)} 岁
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.passportNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.contactPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{member.tour.name}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.tour.status)}`}>
                          {getStatusText(member.tour.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/members/${member.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          查看
                        </Link>
                        <Link
                          href={`/members/${member.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          编辑
                        </Link>
                      </div>
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
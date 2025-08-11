'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string
  
  const [member, setMember] = useState<TourMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMemberDetails()
  }, [memberId])

  const fetchMemberDetails = async () => {
    try {
      const response = await fetch(`/api/members/${memberId}`)
      if (!response.ok) {
        throw new Error('获取团员信息失败')
      }
      const data = await response.json()
      setMember(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male':
        return '男'
      case 'female':
        return '女'
      default:
        return gender
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">团员不存在</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                团员详情
              </h1>
              <p className="text-gray-600">
                {member.firstName} {member.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/members"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回列表
              </Link>
              <Link
                href={`/members/${memberId}/edit`}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                编辑
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">姓名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.firstName} {member.lastName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">性别</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getGenderText(member.gender)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">出生日期</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(member.dateOfBirth).toLocaleDateString('zh-CN')} ({calculateAge(member.dateOfBirth)}岁)
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">护照号码</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.passportNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.contactEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">联系电话</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.contactPhone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">紧急联系人</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.emergencyContactName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">紧急联系人电话</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.emergencyContactPhone}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 特殊需求 */}
              {(member.healthNotes || member.dietaryRestrictions) && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">特殊需求</h2>
                  </div>
                  <div className="px-6 py-4">
                    <dl className="space-y-4">
                      {member.healthNotes && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">健康备注</dt>
                          <dd className="mt-1 text-sm text-gray-900">{member.healthNotes}</dd>
                        </div>
                      )}
                      {member.dietaryRestrictions && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">饮食限制</dt>
                          <dd className="mt-1 text-sm text-gray-900">{member.dietaryRestrictions}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 旅行团信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">所属旅行团</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">团名</dt>
                      <dd className="mt-1 text-sm text-gray-900">{member.tour.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">状态</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.tour.status)}`}>
                          {getStatusText(member.tour.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">加入时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(member.createdAt).toLocaleDateString('zh-CN')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    <Link
                      href={`/members/${memberId}/edit`}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                    >
                      编辑团员信息
                    </Link>
                    <Link
                      href={`/tours/${member.tour.id}`}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center block"
                    >
                      查看旅行团详情
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
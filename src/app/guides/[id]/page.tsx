'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface TourGuide {
  id: string
  name: string
  gender: string
  contactEmail: string
  contactPhone: string
  languages: string[]
  specialties: string[]
  experience: number
  isActive: boolean
  createdAt: string
  agencyAssignments: {
    id: string
    agency: {
      name: string
    }
  }[]
}

export default function GuideDetailPage() {
  const params = useParams()
  const router = useRouter()
  const guideId = params.id as string
  
  const [guide, setGuide] = useState<TourGuide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGuideDetails()
  }, [guideId])

  const fetchGuideDetails = async () => {
    try {
      const response = await fetch(`/api/guides/${guideId}`)
      if (!response.ok) {
        throw new Error('获取导游信息失败')
      }
      const data = await response.json()
      setGuide(data)
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

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">导游不存在</div>
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
                导游详情
              </h1>
              <p className="text-gray-600">
                {guide.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/guides"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回列表
              </Link>
              <Link
                href={`/guides/${guideId}/edit`}
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
                      <dd className="mt-1 text-sm text-gray-900">{guide.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">性别</dt>
                      <dd className="mt-1 text-sm text-gray-900">{getGenderText(guide.gender)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">工作经验</dt>
                      <dd className="mt-1 text-sm text-gray-900">{guide.experience} 年</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">状态</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          guide.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {guide.isActive ? '启用' : '禁用'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">注册时间</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(guide.createdAt).toLocaleDateString('zh-CN')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">邮箱</dt>
                      <dd className="mt-1 text-sm text-gray-900">{guide.contactEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">联系电话</dt>
                      <dd className="mt-1 text-sm text-gray-900">{guide.contactPhone}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* 语言能力 */}
              {guide.languages.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">语言能力</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {guide.languages.map((language, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 专业特长 */}
              {guide.specialties.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">专业特长</h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 服务旅行社 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">服务旅行社</h2>
                </div>
                <div className="px-6 py-4">
                  {guide.agencyAssignments.length === 0 ? (
                    <p className="text-sm text-gray-500">暂无服务旅行社</p>
                  ) : (
                    <div className="space-y-2">
                      {guide.agencyAssignments.map((assignment) => (
                        <div key={assignment.id} className="text-sm text-gray-900">
                          {assignment.agency?.name || '未知旅行社'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">统计信息</h2>
                </div>
                <div className="px-6 py-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">语言数量</dt>
                      <dd className="mt-1 text-sm text-gray-900">{guide.languages.length} 种</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">专业特长</dt>
                      <dd className="mt-1 text-sm text-gray-900">{guide.specialties.length} 项</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">服务旅行社</dt>
                      <dd className="mt-1 text-sm text-gray-900">{guide.agencyAssignments.length} 家</dd>
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
                      href={`/guides/${guideId}/edit`}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                    >
                      编辑导游信息
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
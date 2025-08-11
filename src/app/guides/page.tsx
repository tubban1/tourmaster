'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'

interface TourGuide {
  id: string
  name: string
  gender: string
  email: string
  contactPhone: string
  languages: string[]
  isActive: boolean
  createdAt: string
  occupiedDates: string[] // 占用日期数组
  agencyAssignments: {
    id: string
    userId: string | null
    user: { id: string; username: string; email: string } | null
    agency: { name: string } | null
    isActiveInAgency: boolean
    agencySpecificEmployeeId: string
    agencySpecificContractType: string
    agencySpecificBaseSalary: number
  }[]
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<TourGuide[]>([])
  const [filteredGuides, setFilteredGuides] = useState<TourGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')

  const [showAccountModal, setShowAccountModal] = useState<null | { mode: 'create' | 'bind' | 'unbind', guide: TourGuide | null, assignment: any }> (null)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  // 获取用户角色，这里需要从真实的session或API获取
  const [userRole, setUserRole] = useState<string>('')
  

  
  // 搜索历史记录
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  
  // 排序状态
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  useEffect(() => {
    // 从API获取当前用户信息
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserRole(data.user.role)
        }
      })
      .catch(err => {
        console.error('获取用户信息失败:', err)
        // 如果获取失败，默认显示为agency_admin（仅用于开发测试）
        setUserRole('agency_admin')
      })
  }, [])

  useEffect(() => {
    fetchGuides()
  }, [])

  useEffect(() => {
    filterGuides()
  }, [guides, searchTerm, genderFilter, statusFilter, languageFilter])

  // 点击外部关闭搜索历史记录
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setShowSearchHistory(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchGuides = async () => {
    try {
      const response = await fetch('/api/guides')
      if (!response.ok) {
        throw new Error('获取导游列表失败')
      }
      const data = await response.json()
      setGuides(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filterGuides = () => {
    let filtered = [...guides]

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(guide => 
        guide.name.toLowerCase().includes(term) ||
        guide.email.toLowerCase().includes(term) ||
        guide.contactPhone.includes(term) ||
        guide.languages.some(lang => lang.toLowerCase().includes(term))
      )
    }

    // 性别筛选
    if (genderFilter !== 'all') {
      filtered = filtered.filter(guide => guide.gender === genderFilter)
    }

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(guide => 
        statusFilter === 'active' ? guide.isActive : !guide.isActive
      )
    }

    // 语言筛选
    if (languageFilter !== 'all') {
      filtered = filtered.filter(guide => 
        guide.languages.includes(languageFilter)
      )
    }

    // 应用排序
    filtered = sortGuides(filtered)
    setFilteredGuides(filtered)
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



  async function handleAccountModalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setModalLoading(true)
    setModalError('')

    try {
      if (showAccountModal?.mode === 'create') {
        const response = await fetch('/api/guides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: showAccountModal.guide?.name || '',
            gender: showAccountModal.guide?.gender || 'other',
            contactPhone: showAccountModal.guide?.contactPhone || '',
            email: showAccountModal.guide?.email || '',
            languages: showAccountModal.guide?.languages || [],
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '创建失败')
        }

        // 创建成功后刷新列表
        await fetchGuides()
        setShowAccountModal(null)
        setForm({ username: '', email: '', password: '' })
      } else if (showAccountModal?.mode === 'bind') {
        const response = await fetch(`/api/guides/${showAccountModal.guide?.id}/bind`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '绑定失败')
        }

        // 绑定成功后刷新列表
        await fetchGuides()
        setShowAccountModal(null)
        setForm({ username: '', email: '', password: '' })
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setModalLoading(false)
    }
  }

  async function handleUnbind() {
    if (!showAccountModal?.assignment) return

    setModalLoading(true)
    setModalError('')

    try {
      const response = await fetch(`/api/guides/${showAccountModal.assignment.id}/unbind`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '解绑失败')
      }

      // 解绑成功后刷新列表
      await fetchGuides()
      setShowAccountModal(null)
    } catch (err) {
      setModalError(err instanceof Error ? err.message : '解绑失败')
    } finally {
      setModalLoading(false)
    }
  }

  // 搜索历史记录处理
  const addToSearchHistory = (term: string) => {
    if (!term.trim()) return
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5)
    setSearchHistory(newHistory)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addToSearchHistory(searchTerm)
  }

  const selectSearchHistory = (term: string) => {
    setSearchTerm(term)
    setShowSearchHistory(false)
  }

  // 排序处理
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortGuides = (guidesToSort: TourGuide[]) => {
    return [...guidesToSort].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'isActive':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        case 'languages':
          aValue = a.languages.length
          bValue = b.languages.length
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center">
          <div className="text-lg">加载中...</div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              导游管理
            </h1>
            <p className="text-gray-600">
              管理旅行社的导游信息和账号绑定
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* 只有非旅行社admin角色才能创建和绑定导游账号 */}
            {userRole !== 'agency_admin' && (
              <>
                <Link
                  href="/guides/new"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  创建导游账号
                </Link>
                <Link
                  href="/guides/bind"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  绑定导游账号
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">总导游数</p>
                <p className="text-2xl font-semibold text-gray-900">{guides.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">在职导游</p>
                <p className="text-2xl font-semibold text-green-600">
                  {guides.filter(g => g.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">已绑定账号</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {guides.filter(g => g.agencyAssignments.some(a => a.userId)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {/* 搜索框 */}
            <div className="md:col-span-2 relative search-container">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                搜索
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="姓名、邮箱、电话、语言..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowSearchHistory(true)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              
              {/* 搜索历史记录 */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                    <span className="text-xs text-gray-500">搜索历史</span>
                    <button
                      onClick={() => setSearchHistory([])}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      清除
                    </button>
                  </div>
                  {searchHistory.map((term, index) => (
                    <div
                      key={index}
                      onClick={() => selectSearchHistory(term)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {term}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 性别筛选 */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </label>
              <select
                id="gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            {/* 状态筛选 */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部</option>
                <option value="active">在职</option>
                <option value="inactive">离职</option>
              </select>
            </div>

            {/* 语言筛选 */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                语言
              </label>
              <select
                id="language"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">全部</option>
                {(() => {
                  const allLanguages = new Set<string>()
                  guides.forEach(guide => {
                    guide.languages.forEach(lang => allLanguages.add(lang))
                  })
                  return Array.from(allLanguages).sort().map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))
                })()}
              </select>
            </div>
          </div>
        </div>

        {/* 导游列表和统计信息 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 导游列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    导游列表 ({filteredGuides.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-500">
                      {guides.filter(g => g.isActive).length} 在职 / {guides.filter(g => !g.isActive).length} 离职
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>导游信息</span>
                          {sortField === 'name' && (
                            <span className="text-indigo-600">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        联系方式
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        语言
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        占用日期
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGuides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {guide.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{guide.name}</div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">{getGenderText(guide.gender)}</span>
                                {/* 状态指示器 */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  guide.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {guide.isActive ? '在职' : '离职'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guide.email}</div>
                          <div className="text-sm text-gray-500">{guide.contactPhone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {guide.languages.slice(0, 3).map((lang, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {lang}
                                </span>
                              ))}
                              {guide.languages.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{guide.languages.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {guide.occupiedDates && guide.occupiedDates.length > 0 ? (
                              <div className="space-y-1">
                                {guide.occupiedDates.slice(0, 3).map((date, index) => (
                                  <div key={index} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    {new Date(date).toLocaleDateString('zh-CN')}
                                  </div>
                                ))}
                                {guide.occupiedDates.length > 3 && (
                                  <div className="text-xs text-gray-500">
                                    +{guide.occupiedDates.length - 3} 个日期
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">可用</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/guides/${guide.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              查看
                            </Link>
                            {/* 只有导游自己才能编辑导游信息 */}
                            {userRole === 'guide' && (
                              <Link
                                href={`/guides/${guide.id}/edit`}
                                className="text-green-600 hover:text-green-900"
                              >
                                编辑
                              </Link>
                            )}
                            {/* 只有非旅行社admin角色才能进行账号绑定操作 */}
                            {userRole !== 'agency_admin' && (
                              guide.agencyAssignments.some(a => a.userId) ? (
                                <button
                                  onClick={() => setShowAccountModal({ mode: 'unbind', guide, assignment: guide.agencyAssignments.find(a => a.userId) })}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  解绑
                                </button>
                              ) : (
                                <button
                                  onClick={() => setShowAccountModal({ mode: 'bind', guide, assignment: null })}
                                  className="text-blue-600 hover:text-red-900"
                                >
                                  绑定
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 右侧统计信息 */}
          <div className="space-y-6">
            {/* 账号绑定统计 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">账号绑定统计</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">已绑定账号</span>
                  <span className="text-sm font-medium text-gray-900">
                    {guides.filter(g => g.agencyAssignments.some(a => a.userId)).length} 名
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">未绑定账号</span>
                    <span className="text-sm font-medium text-gray-900">
                      {guides.filter(g => !g.agencyAssignments.some(a => a.userId)).length} 名
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 语言分布统计 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">语言分布统计</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                {(() => {
                  const languageCounts: { [key: string]: number } = {}
                  guides.forEach(guide => {
                    guide.languages.forEach(lang => {
                      languageCounts[lang] = (languageCounts[lang] || 0) + 1
                    })
                  })
                  
                  const topLanguages = Object.entries(languageCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                  
                  return topLanguages.map(([lang, count]) => (
                    <div key={lang} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{lang}</span>
                      <span className="text-sm font-medium text-gray-900">{count} 名</span>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">管理提示</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  {userRole === 'agency_admin' ? (
                    <>
                      <li>• 旅行社管理员只能查看导游信息</li>
                      <li>• 无法编辑导游信息</li>
                      <li>• 无法进行账号绑定操作</li>
                    </>
                  ) : userRole === 'guide' ? (
                    <>
                      <li>• 导游可以查看自己的详细信息</li>
                      <li>• 可以编辑自己的导游信息</li>
                      <li>• 无法进行账号绑定操作</li>
                    </>
                  ) : (
                    <>
                      <li>• 系统管理员可以查看所有导游信息</li>
                      <li>• 无法编辑导游信息</li>
                      <li>• 可绑定现有账号</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 弹窗表单UI结构 */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {showAccountModal.mode === 'create' && '创建导游账号'}
              {showAccountModal.mode === 'bind' && '绑定已有导游账号'}
              {showAccountModal.mode === 'unbind' && '解绑导游账号'}
            </h2>
            {modalError && <div className="mb-2 text-red-600 text-sm">{modalError}</div>}
            {showAccountModal.mode === 'create' && (
              <form className="space-y-3" onSubmit={handleAccountModalSubmit}>
                <input type="text" className="w-full border rounded px-2 py-1" placeholder="用户名" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                <input type="email" className="w-full border rounded px-2 py-1" placeholder="邮箱" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                <input type="password" className="w-full border rounded px-2 py-1" placeholder="密码" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" className="px-3 py-1 rounded bg-gray-300" onClick={() => setShowAccountModal(null)}>取消</button>
                  <button type="submit" className="px-3 py-1 rounded bg-indigo-600 text-white" disabled={modalLoading}>{modalLoading ? '创建中...' : '创建'}</button>
                </div>
              </form>
            )}
            {showAccountModal.mode === 'bind' && (
              <form className="space-y-3" onSubmit={handleAccountModalSubmit}>
                <input type="text" className="w-full border rounded px-2 py-1" placeholder="用户名" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
                <div className="flex gap-2 justify-end mt-4">
                  <button type="button" className="px-3 py-1 rounded bg-gray-300" onClick={() => setShowAccountModal(null)}>取消</button>
                  <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white" disabled={modalLoading}>{modalLoading ? '绑定中...' : '绑定'}</button>
                </div>
              </form>
            )}
            {showAccountModal.mode === 'unbind' && (
              <div>
                <div className="mb-4">确定要解绑该导游账号吗？解绑后该账号将无法登录本旅行社。</div>
                <div className="flex gap-2 justify-end">
                  <button type="button" className="px-3 py-1 rounded bg-gray-300" onClick={() => setShowAccountModal(null)}>取消</button>
                  <button type="button" className="px-3 py-1 rounded bg-red-600 text-white" disabled={modalLoading} onClick={handleUnbind}>{modalLoading ? '解绑中...' : '解绑'}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
} 
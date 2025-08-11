'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewGuidePage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/guides/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '创建失败')
        setLoading(false)
        return
      }
      setSuccess('导游账号创建成功！')
      setTimeout(() => {
        router.push('/guides')
      }, 1200)
    } catch (err) {
      setError('网络或服务器错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                创建导游账号
              </h1>
              <p className="text-gray-600">
                为旅行社创建新的导游账号
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex gap-6">
            {/* 主要内容区域 */}
            <div className="flex-1 space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      用户名
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      密码
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="text-red-600 text-sm">{error}</div>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="text-green-600 text-sm">{success}</div>
                    </div>
                  )}
                  <div className="flex justify-end space-x-4">
                    <Link
                      href="/guides"
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      取消
                    </Link>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? '创建中...' : '创建账号'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="w-80 space-y-6">
              {/* 快速操作 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">快速操作</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <Link
                    href="/guides"
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                  >
                    返回导游列表
                  </Link>
                  <Link
                    href="/guides/bind"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                  >
                    绑定导游账号
                  </Link>
                </div>
              </div>

              {/* 创建进度 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">创建进度</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">用户名</span>
                    <span className={`text-sm font-medium ${username ? 'text-green-600' : 'text-gray-400'}`}>
                      {username ? '✓' : '待填写'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">邮箱</span>
                    <span className={`text-sm font-medium ${email ? 'text-green-600' : 'text-gray-400'}`}>
                      {email ? '✓' : '待填写'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">密码</span>
                      <span className={`text-sm font-medium ${password ? 'text-green-600' : 'text-gray-400'}`}>
                        {password ? '✓' : '待填写'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">完成度</span>
                      <span className="text-sm font-medium text-gray-900">
                        {[username, email, password].filter(Boolean).length * 33}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 导游统计 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">导游统计</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">总导游数</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">活跃导游</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">平均评分</span>
                      <span className="text-sm font-medium text-gray-900">-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg">
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">创建提示</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 用户名必须唯一</li>
                    <li>• 邮箱用于登录</li>
                    <li>• 密码至少6位</li>
                    <li>• 创建后可绑定信息</li>
                    <li>• 支持多语言导游</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
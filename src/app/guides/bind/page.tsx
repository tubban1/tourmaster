'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BindGuidePage() {
  const [username, setUsername] = useState('')
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
      const res = await fetch('/api/guides/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '绑定失败')
        setLoading(false)
        return
      }
      setSuccess('导游账号绑定成功！')
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
                绑定导游账号
              </h1>
              <p className="text-gray-600">
                绑定现有用户账号到新导游
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/guides"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                返回导游列表
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                  placeholder="输入要绑定的用户名"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  输入现有用户的用户名，系统将创建新导游并绑定该用户
                </p>
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? '绑定中...' : '绑定账号'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 
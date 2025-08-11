'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function InitPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleInit = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '初始化失败')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化失败')
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
                数据库初始化
              </h1>
              <p className="text-gray-600">
                初始化测试数据和账号
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
              {!result && (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          注意
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>此操作将创建测试数据，包括：</p>
                          <ul className="list-disc list-inside mt-1">
                            <li>示例旅行社</li>
                            <li>测试用户账号</li>
                            <li>导游和车辆数据</li>
                            <li>行程和旅行团</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleInit}
                      disabled={loading}
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? '初始化中...' : '开始初始化'}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            初始化成功
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>数据库已成功初始化，测试数据已创建。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        测试账号
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        可以使用以下账号登录系统
                      </p>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        {Object.entries(result.testAccounts).map(([key, account]: [string, any]) => (
                          <div key={key} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                              {account.description}
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <div className="space-y-1">
                                <div><strong>用户名:</strong> {account.username}</div>
                                <div><strong>密码:</strong> {account.password}</div>
                              </div>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        创建的数据
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        系统已创建以下测试数据
                      </p>
                    </div>
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">旅行社</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {result.createdData.agency}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">导游</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {result.createdData.guides.join(', ')}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">车辆</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {result.createdData.vehicles.join(', ')}
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">行程</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {result.createdData.itinerary}
                          </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">旅行团</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {result.createdData.tour}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex space-x-4">
                      <Link
                        href="/"
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center"
                      >
                        前往登录
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center"
                      >
                        直接进入系统
                      </Link>
                    </div>
                  </div>
                </div>
              )}
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
                    href="/"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center block"
                  >
                    前往登录
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center block"
                  >
                    直接进入系统
                  </Link>
                </div>
              </div>

              {/* 初始化统计 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">初始化统计</h2>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">状态</span>
                    <span className={`text-sm font-medium ${result ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result ? '已完成' : '未初始化'}
                    </span>
                  </div>
                  {result && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">测试账号</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Object.keys(result.testAccounts).length} 个
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">导游数据</span>
                        <span className="text-sm font-medium text-gray-900">
                          {result.createdData.guides.length} 个
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">车辆数据</span>
                          <span className="text-sm font-medium text-gray-900">
                            {result.createdData.vehicles.length} 个
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg">
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">初始化提示</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 仅首次使用需要初始化</li>
                    <li>• 会创建测试数据</li>
                    <li>• 包含示例账号</li>
                    <li>• 初始化后可直接使用</li>
                    <li>• 建议在开发环境使用</li>
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
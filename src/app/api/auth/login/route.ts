import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: '账户已被禁用' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: user.id,
      agencyId: user.agencyId,
      role: user.role,
      username: user.username
    })

    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        agency: user.agency
      },
      token
    })

    // 设置HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
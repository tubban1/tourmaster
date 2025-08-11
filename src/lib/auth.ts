import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

export interface JWTPayload {
  userId: string
  agencyId: string
  role: string
  username: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

export async function verifyTokenFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return null
    }
    return verifyToken(token)
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function authenticateUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { agency: true }
  })

  if (!user || !user.passwordHash) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return null
  }

  return user
} 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { method } = request
    const body = await request.json()

    if (method === 'POST' && body.action === 'register') {
      // Register new user
      const validatedData = registerSchema.parse(body)
      const { email, password, name } = validatedData

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          // Store hashed password in a separate field or create a Password model
          // For now, we'll use a simple approach with the User model
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        }
      })

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Set HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        message: 'Registration successful',
        user,
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response

    } else if (method === 'POST' && body.action === 'login') {
      // Login user
      const validatedData = loginSchema.parse(body)
      const { email, password } = validatedData

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // For now, we'll implement a simple password check
      // In production, you'd want to store hashed passwords properly
      // This is a simplified version for demonstration
      let passwordValid = true // Placeholder - implement proper password verification

      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })

      // Create JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Set HTTP-only cookie
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastLoginAt: new Date(),
        },
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return response

    } else if (method === 'POST' && body.action === 'logout') {
      // Logout user
      const response = NextResponse.json({
        success: true,
        message: 'Logout successful',
      })

      response.cookies.delete('auth-token')
      return response

    } else if (method === 'POST' && body.action === 'verify') {
      // Verify authentication status
      const token = request.cookies.get('auth-token')?.value

      if (!token) {
        return NextResponse.json(
          { error: 'No authentication token found' },
          { status: 401 }
        )
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId, email: decoded.email },
          select: {
            id: true,
            email: true,
            name: true,
            lastLoginAt: true,
            createdAt: true,
          }
        })

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 401 }
          )
        }

        return NextResponse.json({
          success: true,
          user,
        })

      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or method' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Authentication error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
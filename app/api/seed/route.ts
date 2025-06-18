import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  
  try {
    // Check if users already exist
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { message: 'Users already exist' },
        { status: 400 }
      )
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12)
    const cashierPassword = await bcrypt.hash('kasir123', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@pos.com',
        name: 'Administrator',
        password: adminPassword,
        role: 'ADMIN'
      }
    })

    // Create cashier user
    const cashier = await prisma.user.create({
      data: {
        email: 'kasir@pos.com',
        name: 'Kasir',
        password: cashierPassword,
        role: 'CASHIER'
      }
    })

    return NextResponse.json({
      message: 'Users created successfully',
      users: [
        { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
        { id: cashier.id, email: cashier.email, name: cashier.name, role: cashier.role }
      ]
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { message: 'Failed to create users', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
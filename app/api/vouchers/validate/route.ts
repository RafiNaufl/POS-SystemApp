import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, subtotal, userId, memberId } = body

    if (!code || !subtotal) {
      return NextResponse.json(
        { error: 'Voucher code and subtotal are required' },
        { status: 400 }
      )
    }

    // Find voucher by code
    const voucher = await prisma.voucher.findUnique({
      where: { code },
      include: {
        transactions: {
          where: {
            OR: [
              { userId: userId || undefined },
              { memberId: memberId || undefined }
            ].filter(condition => Object.values(condition).some(value => value !== undefined))
          }
        }
      }
    })

    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher not found', valid: false },
        { status: 404 }
      )
    }

    // Check if voucher is active
    if (!voucher.isActive) {
      return NextResponse.json(
        { error: 'Voucher is not active', valid: false },
        { status: 400 }
      )
    }

    // Check if voucher is within valid date range
    const now = new Date()
    if (now < voucher.startDate || now > voucher.endDate) {
      return NextResponse.json(
        { error: 'Voucher is expired or not yet valid', valid: false },
        { status: 400 }
      )
    }

    // Check minimum purchase requirement
    if (voucher.minPurchase && subtotal < voucher.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase of ${voucher.minPurchase} required`,
          valid: false
        },
        { status: 400 }
      )
    }

    // Check total usage limit
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return NextResponse.json(
        { error: 'Voucher usage limit exceeded', valid: false },
        { status: 400 }
      )
    }

    // Check per-user usage limit (only for members, not for guest transactions)
    if (voucher.perUserLimit && memberId) {
      const userUsageCount = voucher.transactions.length
      console.log(`Voucher ${code}: Member ${memberId} usage count = ${userUsageCount}, Per user limit = ${voucher.perUserLimit}`)
      if (userUsageCount >= voucher.perUserLimit) {
        return NextResponse.json(
          { error: `Personal usage limit exceeded (${userUsageCount}/${voucher.perUserLimit})`, valid: false },
          { status: 400 }
        )
      }
    }

    // Calculate discount amount
    let discountAmount = 0
    if (voucher.type === 'PERCENTAGE') {
      discountAmount = (subtotal * voucher.value) / 100
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount
      }
    } else if (voucher.type === 'FIXED_AMOUNT') {
      discountAmount = Math.min(voucher.value, subtotal)
    } else if (voucher.type === 'FREE_SHIPPING') {
      // For POS system, this might be a fixed shipping cost
      discountAmount = voucher.value
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: voucher.value
      },
      discountAmount: Math.round(discountAmount * 100) / 100
    })
  } catch (error) {
    console.error('Error validating voucher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
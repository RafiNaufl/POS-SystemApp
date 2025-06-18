import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CartItem {
  productId: string
  quantity: number
  price: number
  categoryId: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items }: { items: CartItem[] } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Get active promotions
    const now = new Date()
    const activePromotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        productPromotions: {
          include: {
            product: true
          }
        },
        categoryPromotions: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let totalDiscount = 0
    const appliedPromotions: any[] = []

    // Calculate discounts for each promotion
    for (const promotion of activePromotions) {
      let promotionDiscount = 0
      const applicableItems: CartItem[] = []

      // Find items that are eligible for this promotion
      for (const item of items) {
        let isEligible = false

        // Check if item's product is in promotion
        if (promotion.productPromotions.some((pp: any) => pp.productId === item.productId)) {
          isEligible = true
        }

        // Check if item's category is in promotion
        if (promotion.categoryPromotions.some((cp: any) => cp.categoryId === item.categoryId)) {
          isEligible = true
        }

        if (isEligible) {
          applicableItems.push(item)
        }
      }

      if (applicableItems.length === 0) continue

      // Calculate discount based on promotion type
      switch (promotion.type) {
        case 'PRODUCT_DISCOUNT':
        case 'CATEGORY_DISCOUNT':
          // Simple percentage or fixed discount
          for (const item of applicableItems) {
            const itemTotal = item.price * item.quantity
            if (promotion.discountValue <= 100) {
              // Percentage discount
              promotionDiscount += (itemTotal * promotion.discountValue) / 100
            } else {
              // Fixed amount discount per item
              promotionDiscount += promotion.discountValue * item.quantity
            }
          }
          break

        case 'BULK_DISCOUNT':
          // Bulk discount based on minimum quantity
          const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalAmount = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

          if (promotion.minQuantity && totalQuantity >= promotion.minQuantity) {
            if (promotion.discountValue <= 100) {
              promotionDiscount += (totalAmount * promotion.discountValue) / 100
            } else {
              promotionDiscount += promotion.discountValue
            }
          }
          break

        case 'BUY_X_GET_Y':
          // Buy X get Y free/discounted
          if (promotion.buyQuantity && promotion.getQuantity) {
            for (const item of applicableItems) {
              const sets = Math.floor(item.quantity / promotion.buyQuantity)
              const freeItems = Math.min(sets * promotion.getQuantity, item.quantity)
              // Assume 100% discount for free items
              promotionDiscount += item.price * freeItems
            }
          }
          break
      }

      if (promotionDiscount > 0) {
        appliedPromotions.push({
          id: promotion.id,
          name: promotion.name,
          type: promotion.type,
          discount: Math.round(promotionDiscount * 100) / 100,
          applicableItems: applicableItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
        totalDiscount += promotionDiscount
      }
    }

    return NextResponse.json({
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      appliedPromotions
    })
  } catch (error) {
    console.error('Error calculating promotions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
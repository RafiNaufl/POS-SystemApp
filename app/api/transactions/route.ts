import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')
    
    const skip = (page - 1) * limit
    
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, customerName, paymentMethod, subtotal, tax, total } = body

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          customerName,
          paymentMethod,
          total: parseFloat(subtotal),
          tax: parseFloat(tax),
          finalTotal: parseFloat(total),
          userId: session.user.id
        }
      })

      // Create transaction items and update product stock
      for (const item of items) {
        await tx.transactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
          }
        })

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return transaction
    })

    // Fetch the complete transaction with items
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: result.id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(completeTransaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  
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
          },
          member: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              points: true
            }
          },
          voucherUsages: {
            include: {
              voucher: {
                select: {
                  code: true,
                  name: true
                }
              }
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
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, customerName, customerPhone, customerEmail, paymentMethod, subtotal, tax, total, pointsUsed = 0, voucherCode, voucherDiscount = 0, promoDiscount = 0 } = body

    // Check if customer is a member
    let member = null
    if (customerPhone || customerEmail) {
      member = await prisma.member.findFirst({
        where: {
          OR: [
            customerPhone ? { phone: customerPhone } : {},
            customerEmail ? { email: customerEmail } : {}
          ].filter(condition => Object.keys(condition).length > 0)
        }
      })
    }

    // Calculate points earned (1 point per 10,000)
    const finalTotal = parseFloat(total)
    const pointsEarned = member ? Math.floor(finalTotal / 10000) : 0

    // Validate points usage
    if (pointsUsed > 0 && (!member || member.points < pointsUsed)) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          customerName,
          customerPhone,
          customerEmail,
          memberId: member?.id || null,
          pointsEarned,
          pointsUsed,
          paymentMethod,
          total: parseFloat(subtotal),
          tax: parseFloat(tax),
          finalTotal,
          voucherDiscount,
          promoDiscount,
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

      // Update member points and create point history
      if (member) {
        // Update member points
        await tx.member.update({
          where: { id: member.id },
          data: {
            points: {
              increment: pointsEarned - pointsUsed
            },
            totalSpent: {
              increment: finalTotal
            },
            lastVisit: new Date()
          }
        })

        // Create point history for earned points
        if (pointsEarned > 0) {
          await tx.pointHistory.create({
            data: {
              memberId: member.id,
              points: pointsEarned,
              type: 'EARNED',
              description: `Earned ${pointsEarned} points from transaction`,
              transactionId: transaction.id
            }
          })
        }

        // Create point history for used points
        if (pointsUsed > 0) {
          await tx.pointHistory.create({
            data: {
              memberId: member.id,
              points: -pointsUsed,
              type: 'USED',
              description: `Used ${pointsUsed} points for transaction`,
              transactionId: transaction.id
            }
          })
        }
      }

      // Record voucher usage if voucher was applied
      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({
          where: { code: voucherCode }
        })
        
        if (voucher) {
          await tx.voucherUsage.create({
            data: {
              voucherId: voucher.id,
              userId: transaction.memberId ? null : session.user.id,
              memberId: transaction.memberId || null,
              transactionId: transaction.id,
              discountAmount: voucherDiscount
            }
          })
          
          // Update voucher usage count
          await tx.voucher.update({
            where: { id: voucher.id },
            data: {
              usageCount: {
                increment: 1
              }
            }
          })
        }
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
        },
        member: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            points: true
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

export async function PATCH(request: NextRequest) {
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, paymentStatus, xenditChargeId, xenditReferenceId, status } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(paymentStatus && { paymentStatus }),
        ...(xenditChargeId && { xenditChargeId }),
        ...(xenditReferenceId && { xenditReferenceId }),
        ...(status && { status }),
        ...(paymentStatus === 'PAID' && { paidAt: new Date() })
      }
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
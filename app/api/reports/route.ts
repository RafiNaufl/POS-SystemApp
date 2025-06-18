import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7days'
    
    // Calculate date range
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    
    const startDate = new Date()
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }
    startDate.setHours(0, 0, 0, 0)

    // Get transactions in date range
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Process sales data by date
    const salesByDate = new Map<string, { sales: number; transactions: number }>()
    
    transactions.forEach((transaction: any) => {
      const dateKey = transaction.createdAt.toISOString().split('T')[0]
      const existing = salesByDate.get(dateKey) || { sales: 0, transactions: 0 }
      salesByDate.set(dateKey, {
        sales: existing.sales + transaction.total,
        transactions: existing.transactions + 1
      })
    })

    const salesData = Array.from(salesByDate.entries()).map(([date, data]) => ({
      date,
      sales: data.sales,
      transactions: data.transactions
    }))

    // Process category data
    const categoryStats = new Map<string, { value: number; revenue: number }>()
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']
    let colorIndex = 0

    transactions.forEach((transaction: any) => {
      transaction.items.forEach((item: any) => {
        if (item.product?.category) {
          const categoryName = item.product.category.name
          const existing = categoryStats.get(categoryName) || { value: 0, revenue: 0 }
          categoryStats.set(categoryName, {
            value: existing.value + item.quantity,
            revenue: existing.revenue + item.subtotal
          })
        }
      })
    })

    const totalCategoryQuantity = Array.from(categoryStats.values())
      .reduce((sum: number, cat) => sum + cat.value, 0)

    const categoryData = Array.from(categoryStats.entries()).map(([name, stats]: [string, { value: number; revenue: number }]) => ({
      name,
      value: totalCategoryQuantity > 0 ? Math.round((stats.value / totalCategoryQuantity) * 100) : 0,
      color: colors[colorIndex++ % colors.length]
    }))

    // Process top products
    const productStats = new Map<string, { quantity: number; revenue: number }>()
    
    transactions.forEach((transaction: any) => {
      transaction.items.forEach((item: any) => {
        if (item.product) {
          const productName = item.product.name
          const existing = productStats.get(productName) || { quantity: 0, revenue: 0 }
          productStats.set(productName, {
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.subtotal
          })
        }
      })
    })

    const topProducts = Array.from(productStats.entries())
      .map(([name, stats]: [string, { quantity: number; revenue: number }]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Calculate summary
    const totalSales = transactions.reduce((sum: number, t: any) => sum + t.total, 0)
    const totalTransactions = transactions.length
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0
    
    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate)
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    previousStartDate.setDate(previousStartDate.getDate() - periodDays)
    
    const previousEndDate = new Date(startDate)
    previousEndDate.setDate(previousEndDate.getDate() - 1)
    
    const previousTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      }
    })
    
    const previousSales = previousTransactions.reduce((sum: number, t: any) => sum + t.total, 0)
    const growth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0

    const summary = {
      totalSales,
      totalTransactions,
      averageTransaction: Math.round(averageTransaction),
      growth: Math.round(growth * 100) / 100
    }

    const reportData = {
      salesData,
      categoryData,
      topProducts,
      summary
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching report data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    )
  }
}
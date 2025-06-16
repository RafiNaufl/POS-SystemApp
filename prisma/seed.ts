import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if users already exist
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed')
      return
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

    // Create sample categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Makanan',
          description: 'Kategori makanan'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Minuman',
          description: 'Kategori minuman'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Snack',
          description: 'Kategori snack'
        }
      })
    ])

    // Create sample products
    await Promise.all([
      prisma.product.create({
        data: {
          name: 'Nasi Goreng',
          description: 'Nasi goreng spesial',
          price: 15000,
          stock: 50,
          categoryId: categories[0].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Mie Ayam',
          description: 'Mie ayam bakso',
          price: 12000,
          stock: 30,
          categoryId: categories[0].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Es Teh',
          description: 'Es teh manis',
          price: 3000,
          stock: 100,
          categoryId: categories[1].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Kopi',
          description: 'Kopi hitam',
          price: 5000,
          stock: 80,
          categoryId: categories[1].id
        }
      }),
      prisma.product.create({
        data: {
          name: 'Keripik',
          description: 'Keripik kentang',
          price: 8000,
          stock: 25,
          categoryId: categories[2].id
        }
      })
    ])

    console.log('Database seeded successfully!')
    console.log('Admin user: admin@pos.com / admin123')
    console.log('Cashier user: kasir@pos.com / kasir123')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
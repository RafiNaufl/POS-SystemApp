import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if users already exist
    const existingUsers = await prisma.user.count()
    
    if (existingUsers === 0) {
      // Create users only if they don't exist
      await createUsers()
    } else {
      console.log('Users already exist, skipping user creation')
    }
    
    // Add new products if they don't exist
    await addNewProducts()
    
    // Update products with images if they don't have them
    await updateProductImages()
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

async function createUsers() {

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
      }),
      prisma.category.create({
        data: {
          name: 'Dessert',
          description: 'Kategori dessert'
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
          categoryId: categories[0].id,
          image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Mie Ayam',
          description: 'Mie ayam bakso',
          price: 12000,
          stock: 30,
          categoryId: categories[0].id,
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Es Teh',
          description: 'Es teh manis',
          price: 3000,
          stock: 100,
          categoryId: categories[1].id,
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Kopi',
          description: 'Kopi hitam',
          price: 5000,
          stock: 80,
          categoryId: categories[1].id,
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Keripik',
          description: 'Keripik kentang',
          price: 8000,
          stock: 25,
          categoryId: categories[2].id,
          image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop&crop=center'
        }
      }),
      // Makanan Utama tambahan
      prisma.product.create({
        data: {
          name: 'Ayam Bakar',
          description: 'Ayam bakar bumbu kecap dengan lalapan',
          price: 28000,
          stock: 15,
          categoryId: categories[0].id,
          image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Gado-gado',
          description: 'Gado-gado dengan bumbu kacang',
          price: 18000,
          stock: 20,
          categoryId: categories[0].id,
          image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Soto Ayam',
          description: 'Soto ayam kuning dengan telur dan kerupuk',
          price: 22000,
          stock: 18,
          categoryId: categories[0].id,
          image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Rendang',
          description: 'Rendang daging sapi dengan nasi putih',
          price: 35000,
          stock: 12,
          categoryId: categories[0].id,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center'
        }
      }),
      // Minuman tambahan
      prisma.product.create({
        data: {
          name: 'Jus Jeruk',
          description: 'Jus jeruk segar tanpa gula tambahan',
          price: 12000,
          stock: 40,
          categoryId: categories[1].id,
          image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Es Campur',
          description: 'Es campur dengan berbagai topping',
          price: 15000,
          stock: 25,
          categoryId: categories[1].id,
          image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Cappuccino',
          description: 'Cappuccino dengan foam susu',
          price: 18000,
          stock: 30,
          categoryId: categories[1].id,
          image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Teh Tarik',
          description: 'Teh tarik Malaysia yang creamy',
          price: 8000,
          stock: 50,
          categoryId: categories[1].id,
          image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop&crop=center'
        }
      }),
      // Snack tambahan
      prisma.product.create({
        data: {
          name: 'Pisang Goreng',
          description: 'Pisang goreng crispy dengan gula halus',
          price: 10000,
          stock: 30,
          categoryId: categories[2].id,
          image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Tahu Isi',
          description: 'Tahu isi dengan sayuran dan tauge',
          price: 6000,
          stock: 40,
          categoryId: categories[2].id,
          image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Martabak Mini',
          description: 'Martabak mini telur dengan daun bawang',
          price: 12000,
          stock: 20,
          categoryId: categories[2].id,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center'
        }
      }),
      // Dessert
      prisma.product.create({
        data: {
          name: 'Es Krim Vanilla',
          description: 'Es krim vanilla premium dengan topping',
          price: 15000,
          stock: 25,
          categoryId: categories[3].id,
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Puding Coklat',
          description: 'Puding coklat lembut dengan saus karamel',
          price: 12000,
          stock: 20,
          categoryId: categories[3].id,
          image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center'
        }
      }),
      prisma.product.create({
        data: {
          name: 'Klepon',
          description: 'Klepon tradisional dengan kelapa parut',
          price: 8000,
          stock: 35,
          categoryId: categories[3].id,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center'
        }
      })
    ])

    console.log('Database seeded successfully!')
    console.log('Admin user: admin@pos.com / admin123')
    console.log('Cashier user: kasir@pos.com / kasir123')
}

async function addNewProducts() {
  try {
    // Get existing categories
    const categories = await prisma.category.findMany()
    if (categories.length === 0) {
      console.log('No categories found, skipping product creation')
      return
    }

    // List of new products to add
    const newProducts = [
      {
        name: 'Ayam Bakar',
        description: 'Ayam bakar bumbu kecap dengan lalapan',
        price: 28000,
        stock: 15,
        categoryName: 'Makanan',
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Gado-gado',
        description: 'Gado-gado dengan bumbu kacang',
        price: 18000,
        stock: 20,
        categoryName: 'Makanan',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Soto Ayam',
        description: 'Soto ayam kuning dengan telur dan kerupuk',
        price: 22000,
        stock: 18,
        categoryName: 'Makanan',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Rendang',
        description: 'Rendang daging sapi dengan nasi putih',
        price: 35000,
        stock: 12,
        categoryName: 'Makanan',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Jus Jeruk',
        description: 'Jus jeruk segar tanpa gula tambahan',
        price: 12000,
        stock: 40,
        categoryName: 'Minuman',
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Es Campur',
        description: 'Es campur dengan berbagai topping',
        price: 15000,
        stock: 25,
        categoryName: 'Minuman',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Cappuccino',
        description: 'Cappuccino dengan foam susu',
        price: 18000,
        stock: 30,
        categoryName: 'Minuman',
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Teh Tarik',
        description: 'Teh tarik Malaysia yang creamy',
        price: 8000,
        stock: 50,
        categoryName: 'Minuman',
        image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Pisang Goreng',
        description: 'Pisang goreng crispy dengan gula halus',
        price: 10000,
        stock: 30,
        categoryName: 'Snack',
        image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Tahu Isi',
        description: 'Tahu isi dengan sayuran dan tauge',
        price: 6000,
        stock: 40,
        categoryName: 'Snack',
        image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Martabak Mini',
        description: 'Martabak mini telur dengan daun bawang',
        price: 12000,
        stock: 20,
        categoryName: 'Snack',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Es Krim Vanilla',
        description: 'Es krim vanilla premium dengan topping',
        price: 15000,
        stock: 25,
        categoryName: 'Dessert',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Puding Coklat',
        description: 'Puding coklat lembut dengan saus karamel',
        price: 12000,
        stock: 20,
        categoryName: 'Dessert',
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center'
      },
      {
        name: 'Klepon',
        description: 'Klepon tradisional dengan kelapa parut',
        price: 8000,
        stock: 35,
        categoryName: 'Dessert',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center'
      }
    ]

    // Add products that don't exist yet
    for (const productData of newProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      })

      if (!existingProduct) {
        const category = categories.find((c: any) => c.name === productData.categoryName)
        if (category) {
          await prisma.product.create({
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              stock: productData.stock,
              categoryId: category.id,
              image: productData.image
            }
          })
          console.log(`Added new product: ${productData.name}`)
        }
      }
    }

    console.log('New products added successfully!')
  } catch (error) {
    console.error('Error adding new products:', error)
    throw error
  }
}

async function updateProductImages() {
  try {
    // Check if products need image updates
    const productsWithoutImages = await prisma.product.findMany({
      where: {
        OR: [
          { image: null },
          { image: '' }
        ]
      }
    })

    if (productsWithoutImages.length === 0) {
      console.log('All products already have images')
      return
    }

    // Update products with images based on their names
    const imageMap: { [key: string]: string } = {
      'Nasi Goreng': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center',
      'Mie Ayam': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center',
      'Es Teh': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&crop=center',
      'Kopi': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
      'Keripik': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop&crop=center',
      'Ayam Bakar': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center',
      'Gado-gado': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center',
      'Soto Ayam': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&crop=center',
      'Rendang': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&crop=center',
      'Jus Jeruk': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&crop=center',
      'Es Campur': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
      'Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&crop=center',
      'Teh Tarik': 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop&crop=center',
      'Pisang Goreng': 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=300&fit=crop&crop=center',
      'Tahu Isi': 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=400&h=300&fit=crop&crop=center',
      'Martabak Mini': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=center',
      'Es Krim Vanilla': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&crop=center',
      'Puding Coklat': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
      'Klepon': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center'
    }

    for (const product of productsWithoutImages) {
      const imageUrl = imageMap[product.name]
      if (imageUrl) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: imageUrl }
        })
        console.log(`Updated image for product: ${product.name}`)
      }
    }

    console.log('Product images updated successfully!')
  } catch (error) {
    console.error('Error updating product images:', error)
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
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  category: string
  categoryName: string
  isActive: boolean
  createdAt: string
  image?: string
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)

  // Fetch data from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?includeInactive=true')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      // Transform API data to match our interface
      const transformedProducts = data.map((product: any) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.categoryId.toString(),
        categoryName: product.category?.name || '',
        isActive: product.isActive,
        createdAt: new Date(product.createdAt).toISOString().split('T')[0],
        image: product.image
      }))
      setProducts(transformedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fallback to sample data if API fails
      setProducts([
        {
          id: '1',
          name: 'Nasi Goreng Spesial',
          description: 'Nasi goreng dengan telur, ayam, dan sayuran',
          price: 25000,
          stock: 20,
          category: '1',
          categoryName: 'Makanan Utama',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '2',
          name: 'Mie Ayam Bakso',
          description: 'Mie ayam dengan bakso dan pangsit',
          price: 20000,
          stock: 15,
          category: '1',
          categoryName: 'Makanan Utama',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '3',
          name: 'Ayam Bakar',
          description: 'Ayam bakar bumbu kecap dengan lalapan',
          price: 30000,
          stock: 10,
          category: '1',
          categoryName: 'Makanan Utama',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '4',
          name: 'Es Teh Manis',
          description: 'Teh manis dingin segar',
          price: 5000,
          stock: 50,
          category: '2',
          categoryName: 'Minuman',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '5',
          name: 'Jus Jeruk',
          description: 'Jus jeruk segar tanpa gula tambahan',
          price: 12000,
          stock: 25,
          category: '2',
          categoryName: 'Minuman',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '6',
          name: 'Kopi Hitam',
          description: 'Kopi hitam robusta pilihan',
          price: 8000,
          stock: 30,
          category: '2',
          categoryName: 'Minuman',
          isActive: false,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '7',
          name: 'Es Krim Vanilla',
          description: 'Es krim vanilla premium',
          price: 15000,
          stock: 12,
          category: '3',
          categoryName: 'Dessert',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '8',
          name: 'Puding Coklat',
          description: 'Puding coklat lembut dengan topping',
          price: 10000,
          stock: 8,
          category: '3',
          categoryName: 'Dessert',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '9',
          name: 'Keripik Singkong',
          description: 'Keripik singkong renyah original',
          price: 8000,
          stock: 20,
          category: '4',
          categoryName: 'Snack',
          isActive: true,
          createdAt: '2024-01-15',
          image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop&crop=center',
        },
        {
          id: '10',
          name: 'Pisang Goreng',
          description: 'Pisang goreng crispy dengan gula halus',
          price: 12000,
          stock: 15,
          category: '4',
          categoryName: 'Snack',
          isActive: true,
          createdAt: '2024-01-15',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      // Transform API data to match our interface
      const transformedCategories = data.map((category: any) => ({
        id: category.id.toString(),
        name: category.name
      }))
      setCategories(transformedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to sample data if API fails
      setCategories([
        { id: '1', name: 'Makanan Utama' },
        { id: '2', name: 'Minuman' },
        { id: '3', name: 'Dessert' },
        { id: '4', name: 'Snack' },
      ])
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesStatus = showInactive || product.isActive
    return matchesSearch && matchesCategory && matchesStatus
  })

  const toggleProductStatus = (id: string) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { ...product, isActive: !product.isActive }
        : product
    ))
    toast.success('Status produk berhasil diubah')
  }

  const deleteProduct = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(product => product.id !== id))
      toast.success('Produk berhasil dihapus')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Habis', color: 'text-red-600 bg-red-100' }
    if (stock <= 5) return { text: 'Menipis', color: 'text-yellow-600 bg-yellow-100' }
    return { text: 'Tersedia', color: 'text-green-600 bg-green-100' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
            </div>
            <Link
              href="/products/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tambah Produk
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Tampilkan produk nonaktif</span>
              </label>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Menampilkan {filteredProducts.length} dari {products.length} produk
              </p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock)
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                                <span className="text-gray-400 text-xs">IMG</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {product.stock} - {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleProductStatus(product.id)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-gray-500">Total Produk</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-500">Produk Aktif</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter(p => p.stock <= 5 && p.stock > 0).length}
            </div>
            <div className="text-sm text-gray-500">Stok Menipis</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock === 0).length}
            </div>
            <div className="text-sm text-gray-500">Stok Habis</div>
          </div>
        </div>
      </main>
    </div>
  )
}
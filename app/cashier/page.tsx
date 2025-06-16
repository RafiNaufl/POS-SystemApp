'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import {
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowLeftIcon,
  PrinterIcon,
  CreditCardIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  category: {
    id: string
    name: string
  }
  stock: number
  image?: string
}

interface CartItem extends Product {
  quantity: number
}

interface Category {
  id: string
  name: string
}

interface Transaction {
  id: string
  items: CartItem[]
  total: number
  paymentMethod: string
  customerName?: string
  createdAt: Date
}

export default function CashierPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DIGITAL_WALLET'>('CASH')
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Fetch products and categories from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Gagal memuat data produk')
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
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Stok tidak mencukupi')
        return
      }
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      if (product.stock === 0) {
        alert('Produk habis')
        return
      }
      setCart([...cart, {
        ...product,
        quantity: 1
      }])
    }
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id)
      return
    }
    
    const product = products.find(p => p.id === id)
    if (product && newQuantity > product.stock) {
      toast.error('Stok tidak mencukupi')
      return
    }

    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
    toast.success('Item dihapus dari keranjang')
  }

  const clearCart = () => {
    setCart([])
    setCustomerName('')
    toast.success('Keranjang dikosongkan')
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const processPayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong')
      return
    }

    setIsProcessing(true)
    
    try {
      const totals = calculateTotal()
      const transactionData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        paymentMethod,
        customerName: customerName || null
      }
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to process transaction')
      }
      
      const transaction = await response.json()
      
      // Print receipt
      printReceipt()
      
      // Clear cart and refresh products
      clearCart()
      fetchProducts() // Refresh to get updated stock
      
      toast.success('Pembayaran berhasil!')
    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Pembayaran gagal! ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const printReceipt = () => {
    const { subtotal, tax, total } = calculateTotal()
    const receiptContent = `
      ===== POS RESTAURANT =====
      Tanggal: ${new Date().toLocaleDateString('id-ID')}
      Waktu: ${new Date().toLocaleTimeString('id-ID')}
      Kasir: Admin
      ${customerName ? `Pelanggan: ${customerName}` : ''}
      
      ===== DETAIL PESANAN =====
      ${cart.map(item => 
        `${item.name}\n${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
      ).join('\n\n')}
      
      ===== TOTAL =====
      Subtotal: ${formatCurrency(subtotal)}
      Pajak (10%): ${formatCurrency(tax)}
      Total: ${formatCurrency(total)}
      
      Metode Pembayaran: ${paymentMethod}
      
      Terima kasih atas kunjungan Anda!
    `
    
    console.log(receiptContent)
    toast.success('Struk dicetak')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const { subtotal, tax, total } = calculateTotal()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Kasir</h1>
          <p className="text-gray-600 mt-2">Kasir: {session.user.name}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            {/* Search and Categories */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada produk yang ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-blue-600 font-bold mb-2">{formatCurrency(product.price)}</p>
                      <p className="text-sm text-gray-500 mb-1">Kategori: {product.category.name}</p>
                      <p className="text-sm text-gray-500 mb-3">Stok: {product.stock}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product)
                        }}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          product.stock === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Habis' : 'Tambah'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Keranjang ({cart.length})
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Customer Name */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nama pelanggan (opsional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Keranjang kosong</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-blue-600 text-sm">{formatCurrency(item.price)} x {item.quantity}</p>
                        <p className="text-xs text-gray-400">{item.category.name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          disabled={item.quantity >= item.stock}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-600 hover:text-red-800 ml-2"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method */}
              {cart.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'CASH', label: 'Tunai', icon: BanknotesIcon },
                      { value: 'CARD', label: 'Kartu', icon: CreditCardIcon },
                      { value: 'DIGITAL_WALLET', label: 'E-Wallet', icon: CreditCardIcon },
                    ].map(method => {
                      const IconComponent = method.icon
                      return (
                        <label key={method.value} className="flex items-center">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="mr-2"
                          />
                          <IconComponent className="h-4 w-4 mr-2" />
                          <span className="text-sm">{method.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Total */}
              {cart.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak (10%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={processPayment}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Proses Pembayaran
                </button>
                {cart.length > 0 && (
                  <button
                    onClick={printReceipt}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Cetak Struk
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
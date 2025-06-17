'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  XCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Add custom CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      animation: fade-in 0.5s ease-out;
    }
    
    .animate-slide-up {
      animation: slide-up 0.6s ease-out;
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `
  document.head.appendChild(styleSheet)
}

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
  pointsUsed?: number
  pointsEarned?: number
  voucherCode?: string | null
  voucherDiscount?: number
  promotionDiscount?: number
  appliedPromotions?: AppliedPromotion[]
}

interface Member {
  id: string
  name: string
  phone?: string
  email?: string
  points: number
  totalSpent: number
}

interface Voucher {
  id: string
  code: string
  name: string
  type: string
  value: number
  minPurchase?: number
  maxUsage?: number
  usageCount: number
  startDate: string
  endDate: string
  isActive: boolean
}

interface Promotion {
  id: string
  name: string
  type: string
  discount: number
  conditions?: any
}

interface AppliedPromotion {
  promotion: Promotion
  discount: number
  appliedItems: string[]
}

export default function CashierPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [member, setMember] = useState<Member | null>(null)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [isSearchingMember, setIsSearchingMember] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'DIGITAL_WALLET'>('CASH')
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [appliedPromotions, setAppliedPromotions] = useState<AppliedPromotion[]>([])
  const [promotionDiscount, setPromotionDiscount] = useState(0)
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([])
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([])
  const [showVoucherList, setShowVoucherList] = useState(false)
  const [showPromotionList, setShowPromotionList] = useState(false)

  // Fetch products and categories from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchAvailableVouchers()
    fetchAvailablePromotions()
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

  const fetchAvailableVouchers = async () => {
    try {
      const response = await fetch('/api/vouchers?active=true')
      if (response.ok) {
        const data = await response.json()
        const activeVouchers = data.filter((voucher: Voucher) => {
          const now = new Date()
          const startDate = new Date(voucher.startDate)
          const endDate = new Date(voucher.endDate)
          return voucher.isActive && now >= startDate && now <= endDate
        })
        setAvailableVouchers(activeVouchers)
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    }
  }

  const fetchAvailablePromotions = async () => {
    try {
      const response = await fetch('/api/promotions?active=true')
      if (response.ok) {
        const data = await response.json()
        const activePromotions = data.filter((promotion: any) => {
          const now = new Date()
          const startDate = new Date(promotion.startDate)
          const endDate = new Date(promotion.endDate)
          return promotion.isActive && now >= startDate && now <= endDate
        })
        setAvailablePromotions(activePromotions)
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
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
    setCustomerPhone('')
    setCustomerEmail('')
    setMember(null)
    setPointsToUse(0)
    setVoucherCode('')
    setAppliedVoucher(null)
    setVoucherDiscount(0)
    setAppliedPromotions([])
    setPromotionDiscount(0)
    toast.success('Keranjang dikosongkan')
  }

  // Member functions
  const searchMember = async () => {
    if (!customerPhone && !customerEmail) {
      toast.error('Masukkan nomor HP atau email untuk mencari member')
      return
    }

    setIsSearchingMember(true)
    try {
      const params = new URLSearchParams()
      if (customerPhone) params.append('phone', customerPhone)
      if (customerEmail) params.append('email', customerEmail)

      const response = await fetch(`/api/members/search?${params}`)
      
      if (response.ok) {
        const memberData = await response.json()
        setMember(memberData)
        setCustomerName(memberData.name)
        toast.success(`Member ditemukan: ${memberData.name} (${memberData.points} poin)`)
      } else {
        setMember(null)
        toast.error('Member tidak ditemukan')
      }
    } catch (error) {
      console.error('Error searching member:', error)
      toast.error('Gagal mencari member')
    } finally {
      setIsSearchingMember(false)
    }
  }

  const createNewMember = async () => {
    if (!customerName) {
      toast.error('Nama pelanggan harus diisi')
      return
    }

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone || null,
          email: customerEmail || null
        })
      })

      if (response.ok) {
        const newMember = await response.json()
        setMember(newMember)
        toast.success(`Member baru berhasil dibuat: ${newMember.name}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat member baru')
      }
    } catch (error) {
      console.error('Error creating member:', error)
      toast.error('Gagal membuat member baru')
    }
  }

  const validateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Masukkan kode voucher')
      return
    }

    setIsValidatingVoucher(true)
    try {
      const { subtotal } = calculateTotal()
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: voucherCode,
          subtotal,
          userId: session?.user?.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAppliedVoucher(data.voucher)
        setVoucherDiscount(data.discountAmount)
        toast.success(`Voucher berhasil diterapkan: ${data.voucher.name}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Voucher tidak valid')
      }
    } catch (error) {
      console.error('Error validating voucher:', error)
      toast.error('Gagal memvalidasi voucher')
    } finally {
      setIsValidatingVoucher(false)
    }
  }

  const removeVoucher = () => {
    setAppliedVoucher(null)
    setVoucherDiscount(0)
    setVoucherCode('')
    toast.success('Voucher dihapus')
  }

  const calculatePromotions = async () => {
    if (cart.length === 0) return

    try {
      const cartItems = cart.map(item => ({
        productId: item.id,
        categoryId: item.category.id,
        quantity: item.quantity,
        price: item.price
      }))

      const response = await fetch('/api/promotions/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems })
      })

      if (response.ok) {
        const data = await response.json()
        setAppliedPromotions(data.appliedPromotions || [])
        setPromotionDiscount(data.totalDiscount || 0)
      }
    } catch (error) {
      console.error('Error calculating promotions:', error)
    }
  }

  // Recalculate promotions when cart changes
  useEffect(() => {
    calculatePromotions()
  }, [cart])

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const pointsDiscount = pointsToUse * 1000 // 1 poin = 1000 rupiah
    const totalBeforeDiscounts = subtotal + tax - pointsDiscount
    const totalVoucherDiscount = voucherDiscount
    const totalPromotionDiscount = promotionDiscount
    const total = Math.max(0, totalBeforeDiscounts - totalVoucherDiscount - totalPromotionDiscount)
    const pointsEarned = member ? Math.floor(total / 10000) : 0
    return { 
      subtotal, 
      tax, 
      total, 
      pointsDiscount, 
      pointsEarned, 
      voucherDiscount: totalVoucherDiscount,
      promotionDiscount: totalPromotionDiscount
    }
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
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        pointsUsed: pointsToUse,
        voucherCode: appliedVoucher?.code || null,
        voucherDiscount: totals.voucherDiscount,
        promoDiscount: totals.promotionDiscount
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
      
      // Set completed transaction data for modal
      const transactionWithItems = {
        id: transaction.id,
        items: cart,
        total: totals.total,
        paymentMethod,
        customerName: customerName || undefined,
        createdAt: new Date(),
        pointsUsed: pointsToUse,
        pointsEarned: totals.pointsEarned,
        voucherCode: appliedVoucher?.code || null,
        voucherDiscount: totals.voucherDiscount,
        promotionDiscount: totals.promotionDiscount,
        appliedPromotions: appliedPromotions
      }
      
      setCompletedTransaction(transactionWithItems)
      setShowTransactionModal(true)
      
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
    const { subtotal, tax, total, voucherDiscount, promotionDiscount } = calculateTotal()
    const pointsUsed = completedTransaction?.pointsUsed ?? 0
    const pointsEarned = completedTransaction?.pointsEarned ?? 0
    const pointDiscount = pointsUsed * 1000
    
    const receiptContent = `
      ===== POS RESTAURANT =====
      Tanggal: ${new Date().toLocaleDateString('id-ID')}
      Waktu: ${new Date().toLocaleTimeString('id-ID')}
      Kasir: ${session?.user?.name || 'Admin'}
      ${customerName ? `Pelanggan: ${customerName}` : ''}
      ${member ? `Member: ${member.name} (${member.phone})` : ''}
      
      ===== DETAIL PESANAN =====
      ${cart.map(item => 
        `${item.name}\n${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
      ).join('\n\n')}
      
      ===== TOTAL =====
      Subtotal: ${formatCurrency(subtotal)}
      Pajak (10%): ${formatCurrency(tax)}
      ${pointsUsed > 0 ? `Diskon Poin (${pointsUsed} poin): -${formatCurrency(pointDiscount)}` : ''}
      ${voucherDiscount > 0 ? `Diskon Voucher (${appliedVoucher?.code}): -${formatCurrency(voucherDiscount)}` : ''}
      ${promotionDiscount > 0 ? `Diskon Promosi: -${formatCurrency(promotionDiscount)}` : ''}
      ${appliedPromotions.length > 0 ? `\n===== PROMOSI DITERAPKAN =====\n${appliedPromotions.map(p => `- ${p.promotion.name}: ${formatCurrency(p.discount)}`).join('\n')}` : ''}
      Total: ${formatCurrency(total)}
      
      Metode Pembayaran: ${paymentMethod}
      
      ${member && pointsEarned > 0 ? `===== POIN MEMBER =====\nPoin yang didapat: +${pointsEarned} poin\nTotal poin sekarang: ${(member.points || 0) + pointsEarned} poin\n` : ''}
      
      Terima kasih atas kunjungan Anda!
    `
    
    console.log(receiptContent)
    toast.success('Struk dicetak')
  }

  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined, or invalid numbers
    if (isNaN(amount) || amount === null || amount === undefined) {
      amount = 0
    }
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Kasir {session.user.name}</h1>
                <p className="text-gray-600">Kelola transaksi penjualan</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{cart.reduce((sum, item) => sum + item.quantity, 0)}</div>
                  <div className="text-sm text-gray-500">Item</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(calculateTotal().total)}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-11 pr-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 pt-2 border-t border-gray-100">
                  <span>Total: <span className="font-medium text-blue-600">{products.length}</span></span>
                  <span>Ditemukan: <span className="font-medium text-green-600">{filteredProducts.length}</span></span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => setShowVoucherList(!showVoucherList)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showVoucherList 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Voucher ({availableVouchers.length})
                </button>
                <button
                  onClick={() => setShowPromotionList(!showPromotionList)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showPromotionList 
                      ? 'bg-green-600 text-white' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  Promosi ({availablePromotions.length})
                </button>
              </div>

              {/* Voucher List */}
              {showVoucherList && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Voucher Tersedia</h3>
                  {availableVouchers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Tidak ada voucher tersedia
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableVouchers.map((voucher) => (
                        <div key={voucher.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">{voucher.name}</h4>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {voucher.code}
                            </span>
                          </div>
                          <p className="text-sm text-purple-600 font-medium mb-2">
                            {voucher.type === 'PERCENTAGE' ? `${voucher.value}% OFF` : `Diskon ${formatCurrency(voucher.value)}`}
                          </p>
                          {voucher.minPurchase && (
                            <p className="text-xs text-gray-500 mb-3">
                              Min. pembelian: {formatCurrency(voucher.minPurchase)}
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setVoucherCode(voucher.code)
                              validateVoucher()
                            }}
                            disabled={appliedVoucher !== null}
                            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              appliedVoucher?.code === voucher.code
                                ? 'bg-green-100 text-green-700'
                                : appliedVoucher !== null
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            {appliedVoucher?.code === voucher.code ? 'Diterapkan' : 'Gunakan'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Promotion List */}
              {showPromotionList && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Promosi Tersedia</h3>
                  {availablePromotions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Tidak ada promosi tersedia
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availablePromotions.map((promotion) => (
                        <div key={promotion.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{promotion.name}</h4>
                          <p className="text-sm text-green-600 font-medium mb-3">
                            {promotion.type === 'PRODUCT_DISCOUNT' && 'Diskon Produk'}
                            {promotion.type === 'CATEGORY_DISCOUNT' && 'Diskon Kategori'}
                            {promotion.type === 'BULK_DISCOUNT' && 'Diskon Grosir'}
                            {promotion.type === 'BUY_X_GET_Y' && 'Beli X Dapat Y'}
                          </p>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-xs text-green-700 font-medium">Otomatis diterapkan saat syarat terpenuhi</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Daftar Produk
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredProducts.length} dari {products.length} produk tersedia
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-blue-600 text-sm font-medium">
                      {filteredProducts.length} item
                    </span>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-16 bg-red-50 rounded-xl border-2 border-dashed border-red-200">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <h3 className="text-red-700 text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
                  <p className="text-red-600 mb-6">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🔄 Muat Ulang
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="text-gray-400 text-5xl mb-4">🔍</div>
                  <h3 className="text-gray-600 text-lg font-semibold mb-2">Produk Tidak Ditemukan</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">Tidak ada produk yang sesuai dengan pencarian atau filter yang dipilih. Coba ubah kata kunci atau kategori.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => addToCart(product)}
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`flex flex-col items-center justify-center text-gray-400 ${product.image ? 'hidden' : ''}`}>
                          <div className="text-2xl mb-1">📦</div>
                          <span className="text-xs">No Image</span>
                        </div>
                        
                        {/* Stock Status Badge */}
                        {product.stock <= 5 && (
                          <div className="absolute top-2 right-2">
                            <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                              product.stock === 0 ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                          </div>
                        )}
                        
                        {/* Quick Add Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                              <span className="text-blue-600 text-sm font-medium">+</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-blue-600 font-bold text-sm">{formatCurrency(product.price)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                            {product.category.name}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stock === 0 
                              ? 'bg-red-100 text-red-600' 
                              : product.stock <= 5 
                              ? 'bg-yellow-100 text-yellow-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {product.stock === 0 ? 'Habis' : `${product.stock} stok`}
                          </span>
                        </div>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product)
                        }}
                        className={`w-full mt-3 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          product.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:scale-105'
                        }`}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? '❌ Stok Habis' : 'Tambah ke Keranjang'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Keranjang
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm font-medium">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Customer Details */}
              <div className="mb-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Informasi Pelanggan</h4>
                  
                  <input
                    type="text"
                    placeholder="Nama pelanggan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 mb-3 bg-gray-50"
                    disabled={member !== null}
                  />
                  
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="tel"
                      placeholder="No. Handphone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-gray-50"
                      disabled={member !== null}
                    />
                    <button
                      onClick={searchMember}
                      disabled={isSearchingMember || (!customerPhone && !customerEmail)}
                      className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors font-medium"
                    >
                      {isSearchingMember ? 'Cari...' : 'Cari'}
                    </button>
                  </div>
                  
                  <input
                    type="email"
                    placeholder="Email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 mb-3 bg-gray-50"
                    disabled={member !== null}
                  />
                  
                  {member ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-800">Member: {member.name}</span>
                        <button
                          onClick={() => {
                            setMember(null)
                            setPointsToUse(0)
                            setCustomerName('')
                            setCustomerPhone('')
                            setCustomerEmail('')
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Reset
                        </button>
                      </div>
                      <p className="text-sm text-green-700">Poin tersedia: {member.points}</p>
                      <p className="text-sm text-green-700">Total belanja: {formatCurrency(member.totalSpent)}</p>
                      
                      {member.points > 0 && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-green-700 mb-1">
                            Gunakan Poin (1 poin = Rp 1.000)
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              min="0"
                              max={Math.min(member.points, Math.floor(calculateTotal().total / 1000))}
                              value={pointsToUse}
                              onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => setPointsToUse(Math.min(member.points, Math.floor(calculateTotal().total / 1000)))}
                              className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-lg transition-colors"
                            >
                              Max
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Applied Promotions */}
                      {appliedPromotions.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-medium text-green-800 mb-2">Promosi Aktif</h4>
                          <div className="space-y-2">
                            {appliedPromotions.map((applied, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-green-100 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-green-800">{applied.promotion.name}</p>
                                  <p className="text-xs text-green-600">Diskon: {formatCurrency(applied.discount)}</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    customerName && (customerPhone || customerEmail) && (
                      <button
                        onClick={createNewMember}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm rounded-xl transition-all duration-200 transform hover:scale-105 font-medium shadow-md"
                      >
                        ✨ Daftar sebagai Member Baru
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-2 mb-6">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8 text-sm">Keranjang kosong</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-800">{item.name}</h4>
                        <p className="text-blue-500 text-sm">{formatCurrency(item.price)} x {item.quantity}</p>
                        <p className="text-xs text-gray-400">{item.category.name}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors ml-1"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="ml-3 text-right">
                        <p className="font-medium text-sm text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* Voucher Section */}
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-purple-800">Kode Voucher</h4>
                  </div>
                  {!appliedVoucher ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                          placeholder="Masukkan kode voucher"
                          className="w-full px-4 py-2.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm transition-all duration-200 placeholder-gray-400"
                        />
                      </div>
                      <button
                        onClick={validateVoucher}
                        disabled={isValidatingVoucher || !voucherCode.trim()}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 disabled:transform-none min-w-[100px]"
                      >
                        {isValidatingVoucher ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Validasi...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>🎫</span>
                            <span>Terapkan</span>
                          </div>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-500">✅</span>
                          <p className="text-sm font-semibold text-purple-800">{appliedVoucher.name}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
                          <span className="text-purple-600 font-medium">Kode: {appliedVoucher.code}</span>
                          <span className="text-green-600 font-semibold">Diskon: {formatCurrency(voucherDiscount)}</span>
                        </div>
                      </div>
                      <button
                        onClick={removeVoucher}
                        className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Hapus voucher"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                {cart.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                        <label key={method.value} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) => setPaymentMethod(e.target.value as any)}
                            className="mr-3 text-blue-500"
                          />
                          <IconComponent className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-sm text-gray-700">{method.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Total */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Pajak (10%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    {pointsToUse > 0 && (
                      <div className="flex justify-between text-green-600">
                      <span>Diskon Poin ({pointsToUse} poin):</span>
                      <span>-{formatCurrency(pointsToUse * 1000)}</span>
                    </div>
                  )}
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>Diskon Voucher:</span>
                      <span>-{formatCurrency(voucherDiscount)}</span>
                    </div>
                  )}
                  {promotionDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Promosi:</span>
                      <span>-{formatCurrency(promotionDiscount)}</span>
                    </div>
                    )}
                    <div className="flex justify-between font-medium text-lg border-t border-gray-100 pt-3 mt-3">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-blue-600 font-semibold">{formatCurrency(total)}</span>
                    </div>
                    {calculateTotal().pointsEarned > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <div className="flex justify-between text-sm text-yellow-800">
                          <span>Poin yang didapat:</span>
                          <span className="font-medium text-yellow-800">+{calculateTotal().pointsEarned} poin</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={processPayment}
                  disabled={cart.length === 0}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-medium text-base transition-colors shadow-sm flex items-center justify-center"
                >
                  Proses Pembayaran
                </button>
                {cart.length > 0 && (
                  <button
                    onClick={printReceipt}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-6 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center"
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

      {/* Transaction Success Modal */}
      {showTransactionModal && completedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Pembayaran Berhasil!
                </h3>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">
                        Transaksi ID: {completedTransaction.id}
                      </h4>
                      <p className="text-sm text-green-700">
                        {completedTransaction.createdAt.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kasir</p>
                    <p className="text-sm text-gray-900">{session?.user?.name}</p>
                  </div>
                  {completedTransaction.customerName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pelanggan</p>
                      <p className="text-sm text-gray-900">{completedTransaction.customerName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Metode Pembayaran</p>
                    <p className="text-sm text-gray-900">
                      {completedTransaction.paymentMethod === 'CASH' ? 'Tunai' :
                       completedTransaction.paymentMethod === 'CARD' ? 'Kartu' : 'Dompet Digital'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Item Pembelian</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Produk
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Harga
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {completedTransaction.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(completedTransaction.total / 1.1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pajak (10%):</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(completedTransaction.total * 0.1 / 1.1)}
                      </span>
                    </div>
                    {(completedTransaction.pointsUsed ?? 0) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="text-sm text-gray-600">Diskon Poin ({completedTransaction.pointsUsed} poin):</span>
                        <span className="text-sm text-gray-900">-{formatCurrency((completedTransaction.pointsUsed ?? 0) * 1000)}</span>
                      </div>
                    )}
                    {completedTransaction.voucherCode && (completedTransaction.voucherDiscount ?? 0) > 0 && (
                      <div className="flex justify-between text-purple-600">
                        <span className="text-sm text-gray-600">Diskon Voucher ({completedTransaction.voucherCode}):</span>
                        <span className="text-sm text-gray-900">-{formatCurrency(completedTransaction.voucherDiscount ?? 0)}</span>
                      </div>
                    )}
                    {completedTransaction.appliedPromotions && completedTransaction.appliedPromotions.length > 0 && (
                      <div className="space-y-1">
                        {completedTransaction.appliedPromotions.map((applied, index) => (
                          <div key={index} className="flex justify-between text-green-600">
                            <span className="text-sm text-gray-600">Diskon {applied.promotion.name}:</span>
                            <span className="text-sm text-gray-900">-{formatCurrency(applied.discount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-green-600">
                        {formatCurrency(completedTransaction.total)}
                      </span>
                    </div>
                    {(completedTransaction.pointsEarned ?? 0) > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                        <div className="flex justify-between text-sm text-yellow-800">
                          <span>Poin yang didapat:</span>
                          <span className="font-medium">+{completedTransaction.pointsEarned} poin</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      printReceipt()
                      setShowTransactionModal(false)
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Cetak Struk
                  </button>
                  <button
                    onClick={() => setShowTransactionModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
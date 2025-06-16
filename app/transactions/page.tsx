'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  date: string
  time: string
  items: TransactionItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL_WALLET'
  status: 'COMPLETED' | 'CANCELLED' | 'PENDING'
  cashier: string
  customer?: string
}

interface TransactionItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions')
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      
      // Transform API data to match component interface
      const transformedTransactions: Transaction[] = data.transactions.map((transaction: any) => {
        const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : new Date()
        const isValidDate = createdAt instanceof Date && !isNaN(createdAt.getTime())
        const validDate = isValidDate ? createdAt : new Date()
        
        return {
          id: transaction.id,
          date: validDate.toLocaleDateString('id-ID'),
          time: validDate.toLocaleTimeString('id-ID'),
          items: transaction.items.map((item: any) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            total: item.subtotal
          })),
          subtotal: transaction.total,
          tax: transaction.tax,
          total: transaction.finalTotal,
          paymentMethod: transaction.paymentMethod,
          status: transaction.status,
          cashier: transaction.user.name,
          customer: transaction.customerName
        }
      })
      
      setTransactions(transformedTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Keep sample data as fallback for demo
  const sampleTransactions: Transaction[] = [
    {
      id: 'TXN-001',
      date: '2024-01-21',
      time: '14:30',
      items: [
        { id: '1', name: 'Nasi Goreng Spesial', quantity: 2, price: 25000, total: 50000 },
        { id: '2', name: 'Es Teh Manis', quantity: 2, price: 5000, total: 10000 },
      ],
      subtotal: 60000,
      tax: 6000,
      total: 66000,
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      cashier: 'Admin User',
      customer: 'John Doe',
    },
    {
      id: 'TXN-002',
      date: '2024-01-21',
      time: '15:45',
      items: [
        { id: '3', name: 'Ayam Bakar', quantity: 1, price: 30000, total: 30000 },
        { id: '4', name: 'Jus Jeruk', quantity: 1, price: 12000, total: 12000 },
      ],
      subtotal: 42000,
      tax: 4200,
      total: 46200,
          paymentMethod: 'CARD',
          status: 'COMPLETED',
          cashier: 'Admin User',
        },
        {
          id: 'TXN-003',
          date: '2024-01-21',
          time: '16:20',
          items: [
            { id: '5', name: 'Mie Ayam Bakso', quantity: 3, price: 20000, total: 60000 },
          ],
          subtotal: 60000,
          tax: 6000,
          total: 66000,
          paymentMethod: 'DIGITAL_WALLET',
          status: 'COMPLETED',
          cashier: 'Admin User',
        },
        {
          id: 'TXN-004',
          date: '2024-01-20',
          time: '12:15',
          items: [
            { id: '6', name: 'Gado-gado', quantity: 1, price: 18000, total: 18000 },
            { id: '7', name: 'Es Campur', quantity: 1, price: 15000, total: 15000 },
          ],
          subtotal: 33000,
          tax: 3300,
          total: 36300,
          paymentMethod: 'CASH',
          status: 'CANCELLED',
          cashier: 'Admin User',
        },
        {
          id: 'TXN-005',
          date: '2024-01-20',
          time: '18:30',
          items: [
            { id: '8', name: 'Sate Ayam', quantity: 2, price: 25000, total: 50000 },
            { id: '9', name: 'Lontong Sayur', quantity: 1, price: 15000, total: 15000 },
          ],
          subtotal: 65000,
          tax: 6500,
          total: 71500,
          paymentMethod: 'CARD',
          status: 'PENDING',
          cashier: 'Admin User',
        },
      ]

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((transaction) => transaction.status === statusFilter)
    }

    // Payment method filter
    if (paymentFilter !== 'ALL') {
      filtered = filtered.filter((transaction) => transaction.paymentMethod === paymentFilter)
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const today = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'YESTERDAY':
          filterDate.setDate(today.getDate() - 1)
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'WEEK':
          filterDate.setDate(today.getDate() - 7)
          break
        case 'MONTH':
          filterDate.setMonth(today.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= filterDate
      })
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter, paymentFilter, dateFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = dateString ? new Date(dateString) : new Date()
    const isValidDate = date instanceof Date && !isNaN(date.getTime())
    const validDate = isValidDate ? date : new Date()
    return validDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'Tunai'
      case 'CARD':
        return 'Kartu'
      case 'DIGITAL_WALLET':
        return 'E-Wallet'
      default:
        return method
    }
  }

  const viewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowModal(true)
  }

  const printReceipt = (transaction: Transaction) => {
    // In real app, this would generate and print a receipt
    console.log('Printing receipt for transaction:', transaction.id)
    
    const receiptContent = `
      STRUK PEMBAYARAN
      ================
      
      ID Transaksi: ${transaction.id}
      Tanggal: ${formatDate(transaction.date)} ${transaction.time}
      Kasir: ${transaction.cashier}
      ${transaction.customer ? `Pelanggan: ${transaction.customer}` : ''}
      
      ITEM PEMBELIAN:
      ${transaction.items.map(item => 
        `${item.name} x${item.quantity} = ${formatCurrency(item.total)}`
      ).join('\n      ')}
      
      ================
      Subtotal: ${formatCurrency(transaction.subtotal)}
      Pajak: ${formatCurrency(transaction.tax)}
      TOTAL: ${formatCurrency(transaction.total)}
      
      Metode Pembayaran: ${getPaymentMethodLabel(transaction.paymentMethod)}
      Status: ${transaction.status}
      
      Terima kasih atas kunjungan Anda!
    `
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Struk - ${transaction.id}</title>
            <style>
              body { font-family: monospace; white-space: pre-line; }
            </style>
          </head>
          <body>${receiptContent}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">Selesai</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Pembayaran</option>
              <option value="CASH">Tunai</option>
              <option value="CARD">Kartu</option>
              <option value="DIGITAL_WALLET">E-Wallet</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Tanggal</option>
              <option value="TODAY">Hari Ini</option>
              <option value="YESTERDAY">Kemarin</option>
              <option value="WEEK">7 Hari Terakhir</option>
              <option value="MONTH">30 Hari Terakhir</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('ALL')
                setPaymentFilter('ALL')
                setDateFilter('ALL')
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Transactions Table */}
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
                      ID Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal & Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kasir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.id}
                        </div>
                        {transaction.customer && (
                          <div className="text-sm text-gray-500">
                            {transaction.customer}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {transaction.items.length} item(s)
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.items.slice(0, 2).map((item, index) => (
                            <div key={index}>
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                          {transaction.items.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{transaction.items.length - 2} lainnya
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">
                            {transaction.status === 'COMPLETED' ? 'Selesai' :
                             transaction.status === 'PENDING' ? 'Pending' : 'Dibatalkan'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.cashier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Lihat Detail"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => printReceipt(transaction)}
                            className="text-green-600 hover:text-green-900"
                            title="Cetak Struk"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Tidak ada transaksi yang ditemukan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Transaction Detail Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Transaksi {selectedTransaction.id}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tanggal & Waktu</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedTransaction.date)} {selectedTransaction.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kasir</p>
                    <p className="text-sm text-gray-900">{selectedTransaction.cashier}</p>
                  </div>
                  {selectedTransaction.customer && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pelanggan</p>
                      <p className="text-sm text-gray-900">{selectedTransaction.customer}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                      {getStatusIcon(selectedTransaction.status)}
                      <span className="ml-1">
                        {selectedTransaction.status === 'COMPLETED' ? 'Selesai' :
                         selectedTransaction.status === 'PENDING' ? 'Pending' : 'Dibatalkan'}
                      </span>
                    </span>
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
                        {selectedTransaction.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatCurrency(item.total)}
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
                        {formatCurrency(selectedTransaction.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pajak:</span>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(selectedTransaction.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-base text-gray-900">Total:</span>
                      <span className="text-base text-gray-900">
                        {formatCurrency(selectedTransaction.total)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Metode Pembayaran:</span>
                      <span className="text-sm text-gray-900">
                        {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => printReceipt(selectedTransaction)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Cetak Struk
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
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
  )
}
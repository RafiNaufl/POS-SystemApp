'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface SalesData {
  date: string
  sales: number
  transactions: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface TopProduct {
  name: string
  quantity: number
  revenue: number
}

interface ReportSummary {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
  growth: number
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('7days')
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [summary, setSummary] = useState<ReportSummary>({
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    growth: 0,
  })

  // Fetch real-time data from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/reports?range=${dateRange}`)
        if (response.ok) {
          const data = await response.json()
          setSalesData(data.salesData || [])
          setCategoryData(data.categoryData || [])
          setTopProducts(data.topProducts || [])
          setSummary(data.summary || {
            totalSales: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            growth: 0,
          })
        } else {
          console.error('Failed to fetch report data')
        }
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [dateRange])

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
      month: 'short',
    })
  }

  const exportReport = () => {
    // In real app, this would generate and download a PDF/Excel report
    const reportData = {
      period: dateRange,
      summary,
      salesData,
      categoryData,
      topProducts,
      generatedAt: new Date().toISOString(),
    }
    
    console.log('Exporting report:', reportData)
    
    // Simulate file download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-penjualan-${dateRange}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
              <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="3months">3 Bulan Terakhir</option>
                <option value="1year">1 Tahun Terakhir</option>
              </select>
              <button
                onClick={exportReport}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BanknotesIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Penjualan</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(summary.totalSales)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCartIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summary.totalTransactions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rata-rata Transaksi</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(summary.averageTransaction)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pertumbuhan</p>
                    <p className="text-2xl font-semibold text-green-600">
                      +{summary.growth}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tren Penjualan</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Penjualan']}
                      labelFormatter={(label) => `Tanggal: ${formatDate(label)}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Kategori</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Sales Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Penjualan Harian</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Penjualan']}
                    labelFormatter={(label) => `Tanggal: ${formatDate(label)}`}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Produk Terlaris</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terjual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pendapatan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontribusi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product, index) => {
                      const contribution = (product.revenue / summary.totalSales) * 100
                      return (
                        <tr key={product.name}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.quantity} unit
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${contribution}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {contribution.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface Voucher {
  id: string
  code: string
  name: string
  description?: string
  type: string
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  perUserLimit?: number
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export default function VouchersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchCode, setSearchCode] = useState('')
  const [filterActive, setFilterActive] = useState<string>('all')

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: 0,
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '',
    startDate: '',
    endDate: ''
  })

  const fetchVouchers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (searchCode) params.append('code', searchCode)
      if (filterActive !== 'all') params.append('active', filterActive)

      const response = await fetch(`/api/vouchers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setVouchers(data)
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setLoading(false)
    }
  }, [searchCode, filterActive])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
    fetchVouchers()
  }, [session, status, router, fetchVouchers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
          minPurchase: formData.minPurchase ? Number(formData.minPurchase) : null,
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
          perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : null
        })
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          code: '',
          name: '',
          description: '',
          type: 'PERCENTAGE',
          value: 0,
          minPurchase: '',
          maxDiscount: '',
          usageLimit: '',
          perUserLimit: '',
          startDate: '',
          endDate: ''
        })
        fetchVouchers()
      } else {
        const error = await response.json()
        alert(error.error || 'Error creating voucher')
      }
    } catch (error) {
      console.error('Error creating voucher:', error)
      alert('Error creating voucher')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Voucher</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tambah Voucher
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Kode Voucher
            </label>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan kode voucher"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchVouchers}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penggunaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vouchers.map((voucher) => {
                const now = new Date()
                const startDate = new Date(voucher.startDate)
                const endDate = new Date(voucher.endDate)
                const isExpired = now > endDate
                const isNotStarted = now < startDate
                
                return (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {voucher.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{voucher.name}</div>
                        {voucher.description && (
                          <div className="text-gray-500 text-xs">{voucher.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {voucher.type === 'PERCENTAGE' ? 'Persentase' : 
                         voucher.type === 'FIXED_AMOUNT' ? 'Nominal Tetap' : 'Gratis Ongkir'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voucher.type === 'PERCENTAGE' ? `${voucher.value}%` : formatCurrency(voucher.value)}
                      {voucher.minPurchase && (
                        <div className="text-xs text-gray-500">
                          Min: {formatCurrency(voucher.minPurchase)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voucher.usageCount}
                      {voucher.usageLimit && ` / ${voucher.usageLimit}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{formatDate(voucher.startDate)}</div>
                        <div className="text-gray-500">s/d {formatDate(voucher.endDate)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        !voucher.isActive ? 'bg-gray-100 text-gray-800' :
                        isExpired ? 'bg-red-100 text-red-800' :
                        isNotStarted ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {!voucher.isActive ? 'Tidak Aktif' :
                         isExpired ? 'Kedaluwarsa' :
                         isNotStarted ? 'Belum Dimulai' :
                         'Aktif'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Tambah Voucher Baru</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Voucher *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DISKON10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Voucher *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Diskon 10%"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Deskripsi voucher"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Voucher *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PERCENTAGE">Persentase</option>
                    <option value="FIXED_AMOUNT">Nominal Tetap</option>
                    <option value="FREE_SHIPPING">Gratis Ongkir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nilai {formData.type === 'PERCENTAGE' ? '(%)' : '(Rp)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.type === 'PERCENTAGE' ? "100" : undefined}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.type === 'PERCENTAGE' ? '10' : '50000'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimal Pembelian (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batas Total Penggunaan
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batas Penggunaan per User
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Berakhir *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
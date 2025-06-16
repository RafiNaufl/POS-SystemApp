'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string
  productCount: number
  createdAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [formErrors, setFormErrors] = useState({ name: '', description: '' })

  // Sample data - in real app, this would come from API
  useEffect(() => {
    setTimeout(() => {
      setCategories([
        {
          id: '1',
          name: 'Makanan Utama',
          description: 'Hidangan utama seperti nasi, mie, dan lauk pauk',
          productCount: 8,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Minuman',
          description: 'Berbagai jenis minuman panas dan dingin',
          productCount: 12,
          createdAt: '2024-01-15',
        },
        {
          id: '3',
          name: 'Dessert',
          description: 'Makanan penutup dan camilan manis',
          productCount: 6,
          createdAt: '2024-01-15',
        },
        {
          id: '4',
          name: 'Snack',
          description: 'Camilan ringan dan gorengan',
          productCount: 4,
          createdAt: '2024-01-15',
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const validateForm = () => {
    const errors = { name: '', description: '' }
    
    if (!formData.name.trim()) {
      errors.name = 'Nama kategori wajib diisi'
    } else if (categories.some(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== editingCategory?.id
    )) {
      errors.name = 'Nama kategori sudah ada'
    }
    
    setFormErrors(errors)
    return !errors.name && !errors.description
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (editingCategory) {
      // Update category
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: formData.name, description: formData.description }
          : cat
      ))
      toast.success('Kategori berhasil diperbarui')
      setEditingCategory(null)
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setCategories([...categories, newCategory])
      toast.success('Kategori berhasil ditambahkan')
      setShowAddForm(false)
    }
    
    setFormData({ name: '', description: '' })
    setFormErrors({ name: '', description: '' })
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || '' })
    setFormErrors({ name: '', description: '' })
  }

  const handleDelete = (id: string) => {
    const category = categories.find(cat => cat.id === id)
    
    if (category && category.productCount > 0) {
      toast.error('Tidak dapat menghapus kategori yang masih memiliki produk')
      return
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      setCategories(categories.filter(cat => cat.id !== id))
      toast.success('Kategori berhasil dihapus')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setFormErrors({ name: '', description: '' })
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
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tambah Kategori
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Add/Edit Form */}
        {(showAddForm || editingCategory) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama kategori"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi kategori (opsional)"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingCategory ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TagIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        disabled={category.productCount > 0}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description || 'Tidak ada deskripsi'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium text-blue-600">
                        {category.productCount}
                      </span>
                      <span className="ml-1">produk</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Dibuat: {(() => {
                        const createdAt = category.createdAt ? new Date(category.createdAt) : new Date()
                        const isValidDate = createdAt instanceof Date && !isNaN(createdAt.getTime())
                        const validDate = isValidDate ? createdAt : new Date()
                        return validDate.toLocaleDateString('id-ID')
                      })()}
                    </div>
                  </div>
                  
                  {category.productCount > 0 && (
                    <div className="mt-3">
                      <Link
                        href={`/products?category=${category.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Lihat produk →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kategori</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mulai dengan menambahkan kategori pertama Anda.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center mx-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tambah Kategori
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-500">Total Kategori</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Produk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.filter(cat => cat.productCount > 0).length}
              </div>
              <div className="text-sm text-gray-500">Kategori Aktif</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CASHIER' | 'MANAGER'
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'CASHIER' | 'MANAGER'
  isActive: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER',
    isActive: true,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({})

  // Sample data - in real app, this would come from API
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const sampleUsers: User[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@pos.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: '2024-01-01',
          lastLogin: '2024-01-21T10:30:00Z',
        },
        {
          id: '2',
          name: 'John Doe',
          email: 'john@pos.com',
          role: 'CASHIER',
          isActive: true,
          createdAt: '2024-01-05',
          lastLogin: '2024-01-20T15:45:00Z',
        },
        {
          id: '3',
          name: 'Jane Smith',
          email: 'jane@pos.com',
          role: 'MANAGER',
          isActive: true,
          createdAt: '2024-01-10',
          lastLogin: '2024-01-21T09:15:00Z',
        },
        {
          id: '4',
          name: 'Bob Wilson',
          email: 'bob@pos.com',
          role: 'CASHIER',
          isActive: false,
          createdAt: '2024-01-15',
          lastLogin: '2024-01-18T14:20:00Z',
        },
        {
          id: '5',
          name: 'Alice Brown',
          email: 'alice@pos.com',
          role: 'CASHIER',
          isActive: true,
          createdAt: '2024-01-18',
        },
      ]
      setUsers(sampleUsers)
      setFilteredUsers(sampleUsers)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE'
      filtered = filtered.filter((user) => user.isActive === isActive)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const validateForm = (): boolean => {
    const errors: Partial<UserFormData> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nama harus diisi'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email harus diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid'
    } else {
      // Check if email already exists (exclude current user when editing)
      const existingUser = users.find(
        (user) => user.email === formData.email && user.id !== editingUser?.id
      )
      if (existingUser) {
        errors.email = 'Email sudah digunakan'
      }
    }

    if (!editingUser && !formData.password.trim()) {
      errors.password = 'Password harus diisi'
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive,
              }
            : user
        )
        setUsers(updatedUsers)
        toast.success('Pengguna berhasil diperbarui')
      } else {
        // Add new user
        const newUser: User = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
          createdAt: new Date().toISOString().split('T')[0],
        }
        setUsers([...users, newUser])
        toast.success('Pengguna berhasil ditambahkan')
      }
      
      closeModal()
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan pengguna')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'CASHIER',
        isActive: true,
      })
    }
    setFormErrors({})
    setShowPassword(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CASHIER',
      isActive: true,
    })
    setFormErrors({})
  }

  const toggleUserStatus = async (userId: string) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
      setUsers(updatedUsers)
      
      const user = users.find((u) => u.id === userId)
      toast.success(
        `Pengguna ${user?.isActive ? 'dinonaktifkan' : 'diaktifkan'}`
      )
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengubah status pengguna')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const updatedUsers = users.filter((user) => user.id !== userId)
      setUsers(updatedUsers)
      toast.success('Pengguna berhasil dihapus')
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus pengguna')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />
      case 'MANAGER':
        return <UserCircleIcon className="h-5 w-5 text-blue-500" />
      case 'CASHIER':
        return <UserIcon className="h-5 w-5 text-green-500" />
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator'
      case 'MANAGER':
        return 'Manager'
      case 'CASHIER':
        return 'Kasir'
      default:
        return role
    }
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

  const formatDateTime = (dateString: string) => {
    const date = dateString ? new Date(dateString) : new Date()
    const isValidDate = date instanceof Date && !isNaN(date.getTime())
    const validDate = isValidDate ? date : new Date()
    return validDate.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tambah Pengguna
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Role</option>
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Kasir</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('ALL')
                setStatusFilter('ALL')
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
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
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Login Terakhir
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? formatDateTime(user.lastLogin) : 'Belum pernah'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Pengguna"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {user.isActive ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus Pengguna"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pengguna</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Tidak ada pengguna yang sesuai dengan filter yang dipilih.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <form onSubmit={handleSubmit}>
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan email"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!editingUser && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah' : 'Masukkan password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'CASHIER' | 'MANAGER' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CASHIER">Kasir</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Pengguna aktif
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : editingUser ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
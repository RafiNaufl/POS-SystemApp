'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  roles: string[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['ADMIN', 'CASHIER'] },
  { name: 'Kasir', href: '/cashier', icon: CreditCardIcon, roles: ['ADMIN', 'CASHIER'] },
  { name: 'Produk', href: '/products', icon: CubeIcon, roles: ['ADMIN', 'CASHIER'] },
  { name: 'Kategori', href: '/categories', icon: TagIcon, roles: ['ADMIN'] },
  { name: 'Member', href: '/members', icon: UserIcon, roles: ['ADMIN', 'CASHIER'] },
  { name: 'Transaksi', href: '/transactions', icon: ShoppingCartIcon, roles: ['ADMIN', 'CASHIER'] },
  { name: 'Laporan', href: '/reports', icon: DocumentTextIcon, roles: ['ADMIN', 'CASHIER'] },
  { name: 'Pengguna', href: '/users', icon: UsersIcon, roles: ['ADMIN'] },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) {
    return null
  }

  const userRole = session.user.role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                  <span className="text-white font-bold text-xs">POS</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-gray-900">
                    POS System
                  </span>
                </div>
              </Link>
            </div>
            
            {/* Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mr-2 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          {/* User Info and Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* User Profile */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{session.user.name}</span>
                <span className="text-xs text-blue-600 font-medium">
                  {userRole}
                </span>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-red-200"
              title="Keluar dari sistem"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span className="hidden md:block">Keluar</span>
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-all duration-200 border border-gray-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <XMarkIcon className="block h-5 w-5" />
              ) : (
                <Bars3Icon className="block h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
          {/* Mobile Navigation */}
          <div className="px-4 pt-3 pb-3 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          {/* Mobile User Info */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{session.user.name}</div>
                <div className="text-xs text-gray-500 truncate">{session.user.email}</div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                  {userRole}
                </div>
              </div>
            </div>
            
            {/* Mobile Logout Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border border-gray-200 hover:border-red-200 bg-white"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              <span>Keluar dari Sistem</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
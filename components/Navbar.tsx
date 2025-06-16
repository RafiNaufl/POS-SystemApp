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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                POS System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-700">{session.user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {userRole}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block">
                  {userRole}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
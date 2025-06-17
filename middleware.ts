import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Allow access to login page
    if (pathname === '/login') {
      return NextResponse.next()
    }

    // Redirect to login if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Role-based access control
    const userRole = token.role

    // Admin can access everything
    if (userRole === 'ADMIN') {
      return NextResponse.next()
    }

    // Cashier restrictions
    if (userRole === 'CASHIER') {
      const restrictedPaths = ['/users', '/categories', '/products/new']
      
      // Check if current path is restricted for cashiers
      const isRestricted = restrictedPaths.some(path => pathname.startsWith(path))
      
      if (isRestricted) {
        return NextResponse.redirect(new URL('/cashier', req.url))
      }
      
      // Allow access to cashier, products (read-only), reports, transactions, and members
      const allowedPaths = ['/cashier', '/products', '/reports', '/transactions', '/dashboard', '/members']
      const isAllowed = allowedPaths.some(path => pathname.startsWith(path))
      
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/cashier', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname === '/login') {
          return true
        }
        // Require token for all other pages
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ]
}
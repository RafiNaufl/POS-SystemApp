import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'MANAGER' | 'CASHIER'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'MANAGER' | 'CASHIER'
  }
}
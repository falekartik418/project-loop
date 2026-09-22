import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'ADMIN' | 'ANALYST' | 'VIEWER'
      workspaceId: string
    }
  }
  interface User {
    role: 'ADMIN' | 'ANALYST' | 'VIEWER'
    workspaceId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'ADMIN' | 'ANALYST' | 'VIEWER'
    workspaceId: string
    id: string
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.workspaceId = user.workspaceId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.workspaceId = token.workspaceId
      return session
    },
  },
}
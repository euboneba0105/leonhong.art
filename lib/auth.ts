import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ADMIN_EMAILS = [
  'catherine010512@gmail.com',
  'superleon0122@gmail.com',
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return ADMIN_EMAILS.includes(user.email ?? '')
    },
    async session({ session }) {
      if (session.user) {
        (session.user as any).isAdmin = ADMIN_EMAILS.includes(session.user.email ?? '')
      }
      return session
    },
  },
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
}

export { ADMIN_EMAILS }

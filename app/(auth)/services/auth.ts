import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { cache } from 'react'
import { authConfig } from '@/app/(auth)/services/auth.config'
import { User } from '@/app/models/User'
import { getUserDisplayName, normalizeName } from '@/app/utils/users'

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Google({}),
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '')
          .trim()
          .toLowerCase()
        const password = String(credentials?.password ?? '')

        if (!email || !password) {
          return null
        }

        const user = await User.where('email', email).first()

        if (!user?.passwordHash) {
          return null
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash)

        if (!passwordMatches || !user.emailVerified || !user.active) {
          return null
        }

        return { id: String(user.id), email: user.email }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user, account, profile, trigger }) {
      if (account?.provider === 'google' && token.email) {
        const email = token.email.toLowerCase()
        let dbUser = await User.where('email', email).first()

        // First Google sign-in: the account is created on the fly, already verified.
        if (!dbUser) {
          dbUser = new User()
          dbUser.email = email
          dbUser.passwordHash = null
          dbUser.name = normalizeName(String(profile?.given_name ?? profile?.name ?? '')) || null
          dbUser.emailVerified = true
          dbUser.active = true
          await dbUser.save()
        } else if (!dbUser.emailVerified) {
          // Google already proved ownership of the address: an account registered
          // by email and never verified becomes verified.
          dbUser.emailVerified = true
          await dbUser.save()
        }

        // Banned accounts cannot sign in, even via Google.
        if (!dbUser.active) {
          return null
        }

        token.userId = Number(dbUser.id)
        token.name = getUserDisplayName(dbUser)
      }

      if (account?.provider === 'credentials' && user?.id) {
        const dbUser = await User.find(Number(user.id))

        if (dbUser) {
          token.userId = Number(dbUser.id)
          token.name = getUserDisplayName(dbUser)
        }
      }

      // `unstable_update()` (e.g. after the player renames itself) re-reads the user.
      if (trigger === 'update' && token.userId) {
        const dbUser = await User.find(token.userId)

        if (dbUser) {
          token.name = getUserDisplayName(dbUser)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = String(token.userId)
        session.user.name = token.name ?? session.user.email ?? ''
      }

      return session
    }
  }
})

export const getSession = cache(async () => {
  return await auth()
})

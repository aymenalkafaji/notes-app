import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.email) {
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, profile.email))

        if (existing) {
          token.sub = existing.id
        } else {
          const [created] = await db
            .insert(users)
            .values({
              email: profile.email,
              name: profile.name ?? null,
              image: (profile as any).picture ?? null,
            })
            .returning()
          token.sub = created!.id
        }
      }
      return token
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
  trustHost: true,
})
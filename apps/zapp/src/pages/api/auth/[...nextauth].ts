import NextAuth, { type NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'

import { env } from '../../../env/server.mjs'
import { prisma } from '../../../server/db/client'
import { sendSimpleEmail } from '../../../server/email'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      // Include user.id on session
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST, // sg: "smtp.sendgrid.net"
        port: Number(env.EMAIL_SERVER_PORT), // sg: 465
        auth: {
          user: env.EMAIL_SERVER_USER, // sg: "apikey"
          pass: env.EMAIL_SERVER_PASSWORD, // sg: api key (with send permissions)
        },
        secure: true,
      },
      from: env.EMAIL_FROM, //"NextAuth.js <no-reply@example.com>",
      sendVerificationRequest: async ({ identifier: email, url, provider: { server, from } }) => {
        const { host } = new URL(url)
        const text = `Sign in to ${host}

${url}

If you did not request this email you can safely ignore it.`
        await sendSimpleEmail(email, `Sign in to ${host}`, text)
      },
    }),
    GithubProvider({
      clientId: env.GITHUB_APP_ID,
      clientSecret: env.GITHUB_APP_SECRET,
    }),
  ],
}

export default NextAuth(authOptions)

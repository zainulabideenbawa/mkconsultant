import prisma from '@/prisma/index'
import { compare } from 'bcrypt'
import { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: AuthOptions = {
  // useSecureCookies:true,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
  },
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'Sign in',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com'
        },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log(credentials)
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }
        console.log(user)
        if (!user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }
        console.log(user.twoFactorEnabled, "user.twoFactorEnabled")
        // After validating the user and password
        if (user.twoFactorEnabled) {
          console.log('Returning 2FA response', {
            id: user.id,
            email: user.email,
            name: user.firstName + " " + user.lastName,
            role: user.role,
            twoFactorRequired: true,
            twoFactorSecret: user.twoFactorSecret // Include the secret for verification
          });

          return {
            id: user.id,
            email: user.email,
            name: user.firstName + " " + user.lastName,
            role: user.role,
            twoFactorRequired: true,
            twoFactorSecret: user.twoFactorSecret // Include the secret for verification
          };
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName + " " + user.lastName,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      let u = user as unknown as any
      if (user) {
        token.id = user.id;
        token.role = u.role;
        token.twoFactorRequired = u.twoFactorRequired || false;
        token.twoFactorSecret = u.twoFactorSecret || null;
      }
      return token;
    },
    session: ({ session, token }) => {
      let s = session as unknown as any
      s.user.id = token.id;
      s.user.role = token.role;
      s.user.twoFactorRequired = token.twoFactorRequired;
      s.user.twoFactorSecret = token.twoFactorSecret;
      return session;
    },
  }
}
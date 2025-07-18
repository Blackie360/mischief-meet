import type { NextAuthOptions } from "next-auth"
import type { User, Account, Profile } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import type { JWT } from "next-auth/jwt"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: false, // Use STARTTLS
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          const nodemailer = require("nodemailer")

          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT) || 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          })

          const result = await transporter.sendMail({
            to: email,
            from: provider.from,
            subject: "Sign in to MeetMischief",
            text: `Sign in to MeetMischief\n\nClick here to sign in: ${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">MeetMischief</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your scheduling companion</p>
                </div>
                <div style="padding: 40px 20px; background: white;">
                  <h2 style="color: #333; margin-bottom: 20px;">Sign in to your account</h2>
                  <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                    Click the button below to securely sign in to your MeetMischief account.
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      Sign In
                    </a>
                  </div>
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.5;">
                      <strong>Security Notice:</strong> This magic link will expire in 24 hours and can only be used once. 
                      If you didn't request this email, you can safely ignore it.
                    </p>
                  </div>
                  <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
                    This email was sent by MeetMischief. If you have any questions, please contact support.
                  </p>
                </div>
              </div>
            `,
          })

          console.log("Verification email sent successfully:", result.messageId)
        } catch (error) {
          console.error("Failed to send verification email:", error)
          throw new Error("Failed to send verification email")
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
      if (!user.email) {
        console.error("No email provided for sign in")
        return false
      }

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (!existingUser) {
          // Create new user with a default username
          const username = user.email
            .split("@")[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "")
            .substring(0, 20) // Limit username length

          // Ensure username is unique
          let finalUsername = username
          let counter = 1
          while (true) {
            const existingUsername = await prisma.user.findUnique({
              where: { username: finalUsername }
            })
            if (!existingUsername) break
            finalUsername = `${username}${counter}`
            counter++
          }

          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              username: finalUsername,
            }
          })
          console.log("New user created:", user.email)
        }
        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (!session.user?.email) {
        return session
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            timezone: true
          }
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.username = dbUser.username
          session.user.name = dbUser.name
          session.user.bio = dbUser.bio
          session.user.timezone = dbUser.timezone
        }
      } catch (error) {
        console.error("Error fetching user session data:", error)
      }

      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("Redirect callback - url:", url, "baseUrl:", baseUrl)
      
      // If user is signing in from the home page, redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        console.log("Redirecting from home page to dashboard")
        return `${baseUrl}/dashboard`
      }
      
      // Handle callback URLs properly
      if (url.startsWith("/")) {
        console.log("Redirecting to relative URL:", `${baseUrl}${url}`)
        return `${baseUrl}${url}`
      }
      
      // If it's a full URL with the same origin, allow it
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (urlObj.origin === baseUrlObj.origin) {
          console.log("Redirecting to same origin URL:", url)
          return url
        }
      } catch (error) {
        console.error("Error parsing URLs in redirect:", error)
      }
      
      // Default redirect to dashboard
      console.log("Default redirect to dashboard")
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see detailed logs
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

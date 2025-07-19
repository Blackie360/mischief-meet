import type { NextAuthOptions } from "next-auth"
import type { User, Account, Profile } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import type { JWT } from "next-auth/jwt"
import { TokenError } from "./token-service"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.addons.execute',
          access_type: 'offline',
          prompt: 'consent',
          response_type: 'code'
        }
      }
    }),
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
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and refresh_token to the token right after sign in
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined // Convert to milliseconds
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
        
        // Add error handling for missing tokens
        if (account.provider === 'google' && !account.access_token) {
          console.error("Missing access token for Google OAuth")
          token.error = "missing_access_token"
        }
        
        // Store the scopes that were granted
        if (account.scope) {
          token.scope = account.scope
          
          // Check if calendar scope was granted
          const hasCalendarScope = account.scope.includes('https://www.googleapis.com/auth/calendar')
          token.hasCalendarScope = hasCalendarScope
          
          if (!hasCalendarScope && account.provider === 'google') {
            console.warn("Google Calendar scope was not granted")
            token.error = "missing_calendar_scope"
          }
        }
      }
      
      // If the token has expired and we have a refresh token, try to refresh it
      if (token.accessTokenExpires && Date.now() > token.accessTokenExpires && token.refreshToken) {
        try {
          // Import dynamically to avoid circular dependencies
          const { refreshAccessToken } = await import('./token-service')
          
          console.log("Access token has expired, refreshing...")
          const refreshedTokens = await refreshAccessToken(token.refreshToken as string)
          
          if (refreshedTokens) {
            token.accessToken = refreshedTokens.accessToken
            token.accessTokenExpires = refreshedTokens.expiresAt
            
            // Clear any previous errors
            if (token.error === "token_expired") {
              delete token.error
            }
            
            // If we have the user ID and provider account ID, update the database
            if (token.sub && token.providerAccountId) {
              const { updateUserTokens } = await import('./token-service')
              await updateUserTokens(
                token.sub,
                token.providerAccountId as string,
                refreshedTokens.accessToken,
                refreshedTokens.expiresAt
              )
            }
          }
        } catch (error) {
          console.error("Error refreshing access token", error)
          
          // Set specific error based on the type
          if (error instanceof TokenError) {
            if (error.code === 'INVALID_GRANT') {
              token.error = "invalid_grant"
            } else {
              token.error = "token_refresh_error"
            }
          } else {
            token.error = "token_expired"
          }
          
          // Keep the expired token for now, but mark it as expired
          token.tokenExpired = true
        }
      }
      
      return token
    },
    
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
        } else if (account && account.provider === 'google') {
          // Check if this Google account is already linked to the user
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: 'google',
            }
          });
          
          // If no Google account is linked yet, link this one
          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              }
            });
            console.log("Linked Google account to existing user:", user.email);
          }
        }
        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async session({ session, token, user }: { session: any; token: JWT; user: any }) {
      if (!session.user?.email) {
        return session
      }

      try {
        // Get user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            timezone: true,
            googleCalendarId: true,
            googleCalendarEnabled: true
          }
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.username = dbUser.username
          session.user.name = dbUser.name
          session.user.bio = dbUser.bio
          session.user.timezone = dbUser.timezone
          session.user.googleCalendarId = dbUser.googleCalendarId
          session.user.googleCalendarEnabled = dbUser.googleCalendarEnabled
        }

        // If this is a Google OAuth session, include the access token
        if (token.provider === 'google') {
          session.accessToken = token.accessToken
          session.refreshToken = token.refreshToken
          session.accessTokenExpires = token.accessTokenExpires
          
          // Include OAuth error information in the session
          if (token.error) {
            session.error = token.error
            session.tokenExpired = token.tokenExpired
            
            // If there's an OAuth error and the user has Google Calendar enabled,
            // we should update their status to reflect the connection issue
            if (dbUser?.googleCalendarEnabled && 
                (token.error === 'token_expired' || 
                 token.error === 'invalid_grant' || 
                 token.error === 'token_refresh_error')) {
              try {
                // Mark Google Calendar as having connection issues
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: {
                    googleCalendarEnabled: false
                  }
                })
                
                // Update the session to reflect this change
                session.user.googleCalendarEnabled = false
                
                console.log(`Disabled Google Calendar for user ${dbUser.id} due to OAuth error: ${token.error}`)
              } catch (updateError) {
                console.error("Error updating user Google Calendar status:", updateError)
              }
            }
          }
          
          // Include scope information
          if (token.hasCalendarScope !== undefined) {
            session.hasCalendarScope = token.hasCalendarScope
          }
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

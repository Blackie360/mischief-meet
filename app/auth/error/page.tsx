"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

const errorMessages = {
  Configuration: "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "You do not have permission to sign in. Please check your email address.",
  Verification: "The verification token has expired or has already been used. Please request a new sign-in link.",
  EmailCreateAccount: "Could not create account. Please try again or contact support.",
  Signin: "There was an error signing you in. Please try again.",
  OAuthSignin: "There was an error signing you in with the provider.",
  OAuthCallback: "There was an error during the OAuth callback.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailSignin: "Could not send email. Please check your email address and try again.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An error occurred during authentication. Please try again.",
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") as keyof typeof errorMessages

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
          <CardDescription>{errorMessages[error] || errorMessages.Default}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
          </div>
          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParticleBackground } from "@/components/particle-background"
import { LetterAnimation } from "@/components/letter-animation"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { Calendar, Clock, Mail, Users, Zap, Shield } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  // Check if user is authenticated and redirect to dashboard
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/dashboard")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Meet<span className="text-purple-600">Mischief</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
              Scheduling meetings just got a whole lot more fun! 🎭
              <br />
              Create chaos-free calendars with a touch of playful mischief.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-bounce-in">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
            >
              <Link href="/auth/signin">Start Your Mischief</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          <div className="relative max-w-md mx-auto animate-float">
            <LetterAnimation />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose MeetMischief?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make scheduling so delightful, you'll actually look forward to booking meetings!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-purple-100">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Scheduling</CardTitle>
                <CardDescription>
                  Set your availability once, and let the magic happen. No more back-and-forth emails!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-pink-100">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Time Zone Magic</CardTitle>
                <CardDescription>
                  Automatically handles time zones so you never have to do the math again.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-blue-100">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Email Notifications</CardTitle>
                <CardDescription>
                  Beautiful confirmation emails that both you and your guests will love.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-green-100">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Guest-Friendly</CardTitle>
                <CardDescription>No account required for guests. Just click, pick a time, and book!</CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-yellow-100">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
                <CardDescription>
                  Built with Next.js for blazing fast performance and smooth animations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-red-100">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Secure & Private</CardTitle>
                <CardDescription>Your data is protected with enterprise-grade security and privacy.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 border-0 text-white">
            <CardContent className="p-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Cause Some Scheduling Mischief?</h3>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users who've made meeting scheduling fun again!
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                <Link href="/auth/signin">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-purple-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 mb-4">Made with 💜 and a little mischief</p>
          <p className="text-sm text-gray-500">© 2024 MeetMischief. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

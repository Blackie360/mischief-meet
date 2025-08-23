import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, LinkIcon, Sparkles, Zap, Users, Shield } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Sparkles,
    title: "Creative Collaboration",
    description: "Unleash your creative potential with seamless team coordination",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant scheduling that keeps up with your creative flow",
  },
  {
    icon: Users,
    title: "Team Sync",
    description: "Keep everyone in the loop with smart availability tracking",
  },
];

const howItWorks = [
  { step: "Join the Mischief", description: "Create your mischief-meet profile" },
  {
    step: "Set Your Rhythm",
    description: "Define when you're ready to create and collaborate",
  },
  {
    step: "Share the Magic",
    description: "Send your unique scheduling link to collaborators",
  },
  {
    step: "Create Together",
    description: "Meet, ideate, and bring your projects to life",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Noise Grain Overlay */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjQiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-32">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Where Creativity Meets Coordination</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black pb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
              mischief-meet
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              The creative professional's secret weapon for seamless collaboration. 
              Schedule meetings that spark innovation, not frustration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={"/dashboard"}>
                <Button size="lg" className="text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/25">
                  Start Creating <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                Watch Demo
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">mischief-meet</h3>
                  <p className="text-gray-300">Creative collaboration made simple</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Built for Creators
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to keep your creative projects flowing without the scheduling chaos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900/50 border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                    <feature.icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-xl text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              How the Magic Happens
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started in minutes and transform how you collaborate
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto border border-purple-500/30 group-hover:border-purple-500/60 transition-all duration-300">
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {index + 1}
                    </span>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-br from-purple-500/30 to-blue-500/30 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="font-bold text-xl mb-3 text-white group-hover:text-purple-300 transition-colors">
                  {step.step}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-purple-500/30 rounded-3xl p-12 text-center backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Ready to Unleash Your Creative Potential?
            </h2>
            <p className="text-xl mb-8 text-gray-300 max-w-3xl mx-auto">
              Join thousands of creators, designers, and innovators who trust mischief-meet 
              to keep their collaborative energy flowing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"/dashboard"}>
                <Button size="lg" className="text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/25">
                  Start Creating Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

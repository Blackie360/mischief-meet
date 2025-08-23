import React from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";
import { PenBox, Sparkles } from "lucide-react";

async function Header() {
  await checkUser();

  return (
    <nav className="mx-auto py-6 px-6 flex justify-between items-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-2xl border-b-4 border-purple-400/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>
      
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-4 group relative z-10">
        <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12">
          🎭
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-white tracking-tight group-hover:text-purple-100 transition-colors duration-200">
            Mischief Meet
          </span>
          <span className="text-sm text-purple-200 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Where connections happen
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-6 relative z-10">
        <Link href="/events?create=true">
          <Button 
            variant="default" 
            className="flex items-center gap-3 bg-white/95 backdrop-blur-sm text-purple-700 hover:bg-white hover:text-purple-800 border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
          >
            <PenBox size={20} />
            <span className="hidden sm:inline">Create Event</span>
          </Button>
        </Link>
        
        <SignedOut>
          <SignInButton forceRedirectUrl="/dashboard">
            <Button 
              variant="outline" 
              className="border-2 border-white/80 text-white hover:bg-white hover:text-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
            >
              Login
            </Button>
          </SignInButton>
        </SignedOut>
        
        <SignedIn>
          <UserMenu />
        </SignedIn>
      </div>
    </nav>
  );
}

export default Header;

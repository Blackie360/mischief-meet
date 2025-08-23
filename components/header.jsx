import React from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { checkUser } from "@/lib/checkUser";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";

async function Header() {
  await checkUser();

  return (
    <nav className="mx-auto py-4 px-6 flex justify-between items-center bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg border-b-4 border-purple-400">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="text-4xl transform group-hover:scale-110 transition-transform duration-200">
          🎭
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-white tracking-tight">
            Mischief Meet
          </span>
          <span className="text-xs text-purple-200 font-medium">
            Where connections happen
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/events?create=true">
          <Button 
            variant="default" 
            className="flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <PenBox size={18} />
            <span className="hidden sm:inline">Create Event</span>
          </Button>
        </Link>
        <SignedOut>
          <SignInButton forceRedirectUrl="/dashboard">
            <Button 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-all duration-200"
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

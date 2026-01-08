"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-linear-to-r from-purple-900 via-indigo-900 to-blue-900 text-white backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold tracking-tight bg-linear-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent hover:from-cyan-100 hover:to-blue-100 transition"
            >
              BarPulse
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              <Link
                href="/explore"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/explore") 
                    ? "bg-white/20 text-cyan-100 shadow-lg" 
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                Explore Bars
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/pricing") 
                    ? "bg-white/20 text-cyan-100 shadow-lg" 
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/help"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/help") 
                    ? "bg-white/20 text-cyan-100 shadow-lg" 
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                Help
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/about") 
                    ? "bg-white/20 text-cyan-100 shadow-lg" 
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive("/contact") 
                    ? "bg-white/20 text-cyan-100 shadow-lg" 
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {session ? (
              <>
                {session.user?.email?.toLowerCase() === "coryarmer@gmail.com" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg border border-white/30 text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  List Your Bar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

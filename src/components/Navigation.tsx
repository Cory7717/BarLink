"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 text-white backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-semibold tracking-tight text-gradient"
            >
              BarLink
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              <Link
                href="/explore"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive("/explore") 
                    ? "bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Explore Bars
              </Link>
              <Link
                href="/pricing"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive("/pricing") 
                    ? "bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/help"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive("/help") 
                    ? "bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Help
              </Link>
              <Link
                href="/about"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive("/about") 
                    ? "bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive("/contact") 
                    ? "bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
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
                    className="px-4 py-2 text-sm btn-secondary"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm btn-primary"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm btn-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm btn-secondary"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm btn-primary"
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

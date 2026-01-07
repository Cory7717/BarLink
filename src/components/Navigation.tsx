"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-950/90 text-white backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold tracking-tight hover:text-emerald-200 transition">
              BarPulse
            </Link>
            <div className="hidden md:flex space-x-2">
              <Link
                href="/explore"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/explore") ? "bg-emerald-600/20 text-emerald-100" : "hover:bg-slate-800"
                }`}
              >
                Explore Bars
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/pricing") ? "bg-emerald-600/20 text-emerald-100" : "hover:bg-slate-800"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/about") ? "bg-emerald-600/20 text-emerald-100" : "hover:bg-slate-800"
                }`}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/contact") ? "bg-emerald-600/20 text-emerald-100" : "hover:bg-slate-800"
                }`}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {session ? (
              <>
                {session.user?.email?.toLowerCase() === "coryarmer@gmail.com" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 rounded-md bg-purple-500 text-white font-semibold hover:bg-purple-400 transition"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-md border border-slate-700 hover:bg-slate-800 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-md hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-md bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
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

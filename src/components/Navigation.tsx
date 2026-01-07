"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold tracking-tight hover:text-purple-300 transition">
              BarLink
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/explore"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/explore")
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
              >
                Explore Bars
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/pricing")
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/about")
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
              >
                About
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-md bg-white text-purple-900 font-medium hover:bg-purple-100 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-md border border-white hover:bg-purple-800 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-md hover:bg-purple-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-md bg-white text-purple-900 font-medium hover:bg-purple-100 transition"
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

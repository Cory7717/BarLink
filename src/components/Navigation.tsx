"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/explore", label: "Explore Bars" },
    { href: "/pricing", label: "Pricing" },
    { href: "/help", label: "Help" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 text-white backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + main links */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-gradient">
              BarLink
            </Link>

            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive(link.href)
                      ? "bg-cyan-500/20 text-cyan-100 shadow-lg shadow-cyan-500/20"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-full border border-white/20 px-3 py-2 text-sm"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>

            {session ? (
              <>
                {session.user?.email?.toLowerCase() === "coryarmer@gmail.com" && (
                  <Link href="/admin" className="hidden sm:inline px-4 py-2 text-sm btn-secondary">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="hidden sm:inline px-4 py-2 text-sm btn-primary">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="hidden sm:inline px-4 py-2 text-sm btn-secondary">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="hidden sm:inline px-4 py-2 text-sm btn-secondary">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="hidden sm:inline px-4 py-2 text-sm btn-primary">
                  List Your Bar
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive(link.href) ? "bg-cyan-500/20 text-cyan-100" : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link href="/dashboard" className="btn-primary w-full text-center text-sm" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                    {session.user?.email?.toLowerCase() === "coryarmer@gmail.com" && (
                      <Link href="/admin" className="btn-secondary w-full text-center text-sm" onClick={() => setMenuOpen(false)}>
                        Admin
                      </Link>
                    )}
                    <button onClick={() => signOut()} className="btn-secondary w-full text-sm">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="btn-secondary w-full text-center text-sm" onClick={() => setMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="btn-primary w-full text-center text-sm" onClick={() => setMenuOpen(false)}>
                      List Your Bar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!isAdminEmail(email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin</h1>
          <nav className="flex gap-3 text-sm">
            <a className="rounded-lg border border-slate-700 px-3 py-1 hover:border-emerald-400" href="/admin">Overview</a>
            <a className="rounded-lg border border-slate-700 px-3 py-1 hover:border-emerald-400" href="/admin/subscriptions">Subscriptions</a>
            <a className="rounded-lg border border-slate-700 px-3 py-1 hover:border-emerald-400" href="/admin/promocodes">Promo Codes</a>
            <a className="rounded-lg border border-slate-700 px-3 py-1 hover:border-emerald-400" href="/admin/free-listings">Free Listings</a>
            <a className="rounded-lg border border-slate-700 px-3 py-1 hover:border-emerald-400" href="/admin/revenue">Revenue</a>
          </nav>
        </header>
        {children}
      </main>
    </div>
  );
}

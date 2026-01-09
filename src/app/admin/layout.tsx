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
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gradient">Admin</h1>
          <nav className="flex flex-wrap gap-2 text-sm">
            <a className="btn-secondary px-3 py-1.5" href="/admin">Overview</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/subscriptions">Subscriptions</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/promocodes">Promo Codes</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/event-categories">Event Categories</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/approvals">Approvals</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/free-listings">Free Listings</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/support">Support</a>
            <a className="btn-secondary px-3 py-1.5" href="/admin/revenue">Revenue</a>
          </nav>
        </header>
        {children}
      </main>
    </div>
  );
}

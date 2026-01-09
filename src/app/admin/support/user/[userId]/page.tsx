import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function UserSupportProfile({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: {
        include: { bar: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    return (
      <div className="glass-panel rounded-3xl p-6">
        <p className="text-slate-300">User not found.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gradient">{user.name || "Unnamed user"}</h2>
            <p className="text-sm text-slate-300">{user.email}</p>
            <p className="text-xs text-slate-400 mt-2">User ID: {user.id}</p>
          </div>
          <Link href="/admin/support" className="btn-secondary px-4 py-2 text-xs">
            Back to search
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className="btn-primary px-4 py-2 text-xs" href={`mailto:${user.email}`}>
            Email user
          </a>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white">Recent favorites</h3>
        {user.favorites.length === 0 ? (
          <p className="text-sm text-slate-300 mt-3">No favorites yet.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {user.favorites.map((fav) => (
              <div key={fav.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white font-semibold">{fav.bar.name}</p>
                <p className="text-xs text-slate-300">{fav.bar.city}, {fav.bar.state}</p>
                <p className="text-xs text-slate-400">Bar ID: {fav.barId}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

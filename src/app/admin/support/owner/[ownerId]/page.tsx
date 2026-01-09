import { prisma } from "@/lib/prisma";
import OwnerSupportActions from "./OwnerSupportActions";
import Link from "next/link";

export default async function OwnerSupportProfile({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;

  const owner = await prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      bars: true,
      subscription: true,
      categoryRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!owner) {
    return (
      <div className="glass-panel rounded-3xl p-6">
        <p className="text-slate-300">Owner not found.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gradient">{owner.name}</h2>
            <p className="text-sm text-slate-300">{owner.email}</p>
            <p className="text-xs text-slate-400 mt-2">Owner ID: {owner.id}</p>
          </div>
          <Link href="/admin/support" className="btn-secondary px-4 py-2 text-xs">
            Back to search
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">Subscription</p>
            <p className="text-lg font-semibold text-white">{owner.subscription?.status || "NO SUB"}</p>
            <p className="text-xs text-slate-400">{owner.subscription?.plan || "N/A"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">Bars</p>
            <p className="text-lg font-semibold text-white">{owner.bars.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-300">Free listings</p>
            <p className="text-lg font-semibold text-white">{owner.allowFreeListings ? "Enabled" : "Disabled"}</p>
          </div>
        </div>
      </div>

      <OwnerSupportActions
        ownerId={owner.id}
        ownerEmail={owner.email}
        allowFreeListings={owner.allowFreeListings}
      />

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white">Bars</h3>
        {owner.bars.length === 0 ? (
          <p className="text-sm text-slate-300 mt-3">No bars on this owner yet.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {owner.bars.map((bar) => (
              <div key={bar.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white font-semibold">{bar.name}</p>
                <p className="text-xs text-slate-300">
                  {bar.city}, {bar.state} • {bar.address}
                </p>
                <p className="text-xs text-slate-400">Bar ID: {bar.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-white">Recent category requests</h3>
        {owner.categoryRequests.length === 0 ? (
          <p className="text-sm text-slate-300 mt-3">No requests yet.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {owner.categoryRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-white font-semibold">{request.category}</p>
                <p className="text-xs text-slate-300">Status: {request.status}</p>
                <p className="text-xs text-slate-400">Requested: {request.createdAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
  const subs = await prisma.subscription.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  }) as any[];

  return (
    <section className="glass-panel rounded-3xl p-4">
      <h2 className="mb-4 text-xl font-semibold text-gradient">Manage subscriptions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="py-2">Owner</th>
              <th className="py-2">Email</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Status</th>
              <th className="py-2">Current period end</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {subs.map((s: any) => (
              <tr key={s.id}>
                <td className="py-2">{s.owner.name}</td>
                <td className="py-2 text-slate-300">{s.owner.email}</td>
                <td className="py-2">{s.plan}</td>
                <td className="py-2">{s.status}</td>
                <td className="py-2">{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "-"}</td>
                <td className="py-2">
                  <form className="inline" action={`/api/admin/subscriptions/update`} method="post">
                    <input type="hidden" name="subscriptionId" value={s.id} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <button className="mr-2 rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-200 hover:bg-emerald-500/10">Activate</button>
                  </form>
                  <form className="inline" action={`/api/admin/subscriptions/update`} method="post">
                    <input type="hidden" name="subscriptionId" value={s.id} />
                    <input type="hidden" name="status" value="CANCELED" />
                    <button className="mr-2 rounded-full border border-red-500/40 px-3 py-1 text-red-200 hover:bg-red-500/10">Cancel</button>
                  </form>
                  <form className="inline" action={`/api/admin/subscriptions/update`} method="post">
                    <input type="hidden" name="subscriptionId" value={s.id} />
                    <input type="hidden" name="status" value="PAUSED" />
                    <button className="rounded-full border border-yellow-500/40 px-3 py-1 text-yellow-200 hover:bg-yellow-500/10">Pause</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
  const subs = await prisma.subscription.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-4 text-xl font-semibold">Manage subscriptions</h2>
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
          <tbody className="divide-y divide-slate-800">
            {subs.map((s) => (
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
                    <button className="mr-2 rounded border border-emerald-500/40 px-2 py-1 text-emerald-200 hover:bg-emerald-500/10">Activate</button>
                  </form>
                  <form className="inline" action={`/api/admin/subscriptions/update`} method="post">
                    <input type="hidden" name="subscriptionId" value={s.id} />
                    <input type="hidden" name="status" value="CANCELED" />
                    <button className="mr-2 rounded border border-red-500/40 px-2 py-1 text-red-200 hover:bg-red-500/10">Cancel</button>
                  </form>
                  <form className="inline" action={`/api/admin/subscriptions/update`} method="post">
                    <input type="hidden" name="subscriptionId" value={s.id} />
                    <input type="hidden" name="status" value="PAUSED" />
                    <button className="rounded border border-yellow-500/40 px-2 py-1 text-yellow-200 hover:bg-yellow-500/10">Pause</button>
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

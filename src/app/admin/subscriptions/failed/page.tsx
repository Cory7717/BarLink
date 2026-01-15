import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminFailedSubscriptionsPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email.toLowerCase() !== "coryarmer@gmail.com") {
    redirect("/admin");
  }

  const failed = await prisma.subscription.findMany({
    where: { status: { in: ["INCOMPLETE", "PAST_DUE"] } },
    include: {
      owner: { select: { email: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <Link href="/admin/subscriptions" className="text-sm text-slate-300 hover:text-white">
        ← Back to subscriptions
      </Link>
      <h1 className="text-3xl font-semibold text-gradient">Failed / Past-due subscriptions</h1>
      <p className="text-sm text-slate-300">Statuses: INCOMPLETE or PAST_DUE</p>

      <div className="glass-panel rounded-3xl p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="px-2 py-1">Owner</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Plan</th>
              <th className="px-2 py-1">Updated</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {failed.map((sub) => (
              <tr key={sub.id} className="border-t border-white/5 text-slate-200">
                <td className="px-2 py-2">{sub.owner.email}</td>
                <td className="px-2 py-2">{sub.status}</td>
                <td className="px-2 py-2">{sub.plan}</td>
                <td className="px-2 py-2 text-xs text-slate-400">{new Date(sub.updatedAt).toLocaleString()}</td>
                <td className="px-2 py-2">
                  <form action={`/api/admin/subscriptions/notify-failed`} method="post" className="inline">
                    <input type="hidden" name="subscriptionId" value={sub.id} />
                    <button type="submit" className="text-xs text-amber-200 hover:text-amber-100 mr-2">
                      Notify owner
                    </button>
                  </form>
                  <Link href="/admin/actions" className="text-xs text-cyan-200 hover:text-cyan-100">
                    View audit
                  </Link>
                </td>
              </tr>
            ))}
            {failed.length === 0 && (
              <tr>
                <td className="px-2 py-2 text-slate-400" colSpan={5}>
                  No failed subscriptions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

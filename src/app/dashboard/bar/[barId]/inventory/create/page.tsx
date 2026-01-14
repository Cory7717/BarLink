import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import CreateInventoryClient from "../CreateInventoryClient";

export default async function CreateInventoryPage({ params }: { params: Promise<{ barId: string }> }) {
  const { barId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    select: { id: true, name: true, owner: { select: { email: true } } },
  });

  if (!bar) redirect("/dashboard");
  if (bar.owner.email !== session.user.email) redirect("/dashboard");

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href={`/dashboard/bar/${bar.id}/inventory`} className="text-sm text-slate-400 hover:text-white mb-2 inline-block">
              Back to inventory
            </Link>
            <h1 className="text-3xl font-semibold text-gradient">{bar.name} - Create Inventory</h1>
            <p className="text-sm text-slate-300 mt-1">
              Build your inventory from a friendly template or upload a CSV. We will save items directly to BarLink.
            </p>
          </div>
        </div>

        <CreateInventoryClient barId={bar.id} />
      </main>
    </div>
  );
}

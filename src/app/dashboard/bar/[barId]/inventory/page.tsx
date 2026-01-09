import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import InventoryManagementClient from "./InventoryManagementClient";

export default async function InventoryPage({ params }: { params: Promise<{ barId: string }> }) {
  const { barId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const owner = await prisma.owner.findUnique({
    where: { email: session.user.email! },
  });

  if (!owner) {
    redirect("/auth/signup");
  }

  const bar = await prisma.bar.findFirst({
    where: {
      id: barId,
      ownerId: owner.id,
    },
    include: {
      inventoryItems: {
        where: { isActive: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!bar) {
    redirect("/dashboard");
  }

  const inventoryItems = bar.inventoryItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    bottleSizeMl: item.bottleSizeMl,
    startingQtyBottles: item.startingQtyBottles,
    costPerBottle: item.costPerBottle ? parseFloat(item.costPerBottle.toString()) : null,
    isActive: item.isActive,
  }));

  return (
    <div className="min-h-screen app-shell text-white">
      <Navigation />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">
              Back to dashboard
            </Link>
            <h1 className="text-3xl font-semibold text-gradient">{bar.name} - Liquor Inventory</h1>
            <p className="text-sm text-slate-300 mt-1">
              {bar.city}, {bar.state}
            </p>
          </div>
          <Link href={`/dashboard/bar/${bar.id}`} className="btn-secondary px-4 py-2 text-sm">
            Manage bar
          </Link>
        </header>

        <InventoryManagementClient barId={bar.id} barSlug={bar.slug} initialItems={inventoryItems} />
      </main>
    </div>
  );
}

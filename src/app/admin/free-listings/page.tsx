"use client";
import { useEffect, useState } from "react";

type Owner = { id: string; name: string; email: string; allowFreeListings: boolean };

export default function AdminFreeListingsPage() {
  const [owners, setOwners] = useState<Owner[]>([]);

  const load = async () => {
    const res = await fetch("/api/admin/owners");
    const data = await res.json();
    setOwners(data.owners || []);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (ownerId: string, allow: boolean) => {
    await fetch("/api/admin/owners/toggle-free-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId, allow }),
    });
    await load();
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="mb-3 text-xl font-semibold">Allow listings to be posted for free</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-300"><tr><th className="py-2">Owner</th><th>Email</th><th>Free listings</th><th></th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {owners.map(o => (
              <tr key={o.id}>
                <td className="py-2">{o.name}</td>
                <td className="py-2 text-slate-300">{o.email}</td>
                <td className="py-2">{o.allowFreeListings ? "Enabled" : "Disabled"}</td>
                <td className="py-2">
                  <button className="rounded border border-slate-700 px-2 py-1 hover:bg-slate-800" onClick={()=>toggle(o.id, !o.allowFreeListings)}>
                    {o.allowFreeListings ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

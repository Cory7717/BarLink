"use client";
import { useEffect, useState } from "react";

type Owner = { id: string; name: string; email: string; allowFreeListings: boolean };

export default function AdminFreeListingsPage() {
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    let isActive = true;

    const loadOwners = async () => {
      const res = await fetch("/api/admin/owners");
      const data = await res.json();
      if (isActive) {
        setOwners(data.owners || []);
      }
    };

    loadOwners();
    return () => {
      isActive = false;
    };
  }, []);

  const toggle = async (ownerId: string, allow: boolean) => {
    await fetch("/api/admin/owners/toggle-free-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId, allow }),
    });
    const res = await fetch("/api/admin/owners");
    const data = await res.json();
    setOwners(data.owners || []);
  };

  return (
    <section className="glass-panel rounded-3xl p-4">
      <h2 className="mb-3 text-xl font-semibold text-gradient">Allow listings to be posted for free</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-300"><tr><th className="py-2">Owner</th><th>Email</th><th>Free listings</th><th></th></tr></thead>
          <tbody className="divide-y divide-white/10">
            {owners.map(o => (
              <tr key={o.id}>
                <td className="py-2">{o.name}</td>
                <td className="py-2 text-slate-300">{o.email}</td>
                <td className="py-2">{o.allowFreeListings ? "Enabled" : "Disabled"}</td>
                <td className="py-2">
                  <button className="btn-secondary px-3 py-1" onClick={()=>toggle(o.id, !o.allowFreeListings)}>
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

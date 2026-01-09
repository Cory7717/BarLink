"use client";

import { useEffect, useState } from "react";

type OwnerResult = {
  id: string;
  name: string;
  email: string;
  allowFreeListings: boolean;
  bars: { id: string; name: string; city: string; state: string }[];
  subscription?: { status: string; plan: string } | null;
};

type UserResult = {
  id: string;
  name?: string | null;
  email: string;
};

export default function AdminSupportPage() {
  const [query, setQuery] = useState("");
  const [owners, setOwners] = useState<OwnerResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setOwners([]);
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/user-search?query=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (res.ok) {
          setOwners(data.owners || []);
          setUsers(data.users || []);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-3xl p-4">
        <h2 className="mb-2 text-xl font-semibold text-gradient">Support search</h2>
        <p className="text-sm text-slate-300 mb-4">
          Search by owner name, bar name, or registered email.
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search owners, bars, or users..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400"
        />
        {loading && <p className="mt-2 text-xs text-slate-400">Searching...</p>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Owners</h3>
          {owners.length === 0 ? (
            <p className="text-sm text-slate-300">No owner matches.</p>
          ) : (
            <div className="space-y-3">
              {owners.map((owner) => (
                <div key={owner.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{owner.name}</p>
                      <p className="text-xs text-slate-300">{owner.email}</p>
                    </div>
                    <span className="text-xs text-slate-300">
                      {owner.subscription?.status || "NO SUB"}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-300">
                    <p>Owner ID: {owner.id}</p>
                    <p>Free listings: {owner.allowFreeListings ? "Yes" : "No"}</p>
                  </div>
                  {owner.bars.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      {owner.bars.map((bar) => (
                        <div key={bar.id}>
                          {bar.name} — {bar.city}, {bar.state} (ID: {bar.id})
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a className="btn-primary px-3 py-1.5 text-xs" href={`/admin/support/owner/${owner.id}`}>
                      Open profile
                    </a>
                    <a className="btn-secondary px-3 py-1.5 text-xs" href={`mailto:${owner.email}`}>
                      Email owner
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-3xl p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Users</h3>
          {users.length === 0 ? (
            <p className="text-sm text-slate-300">No user matches.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{user.name || "Unnamed user"}</p>
                  <p className="text-xs text-slate-300">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-2">User ID: {user.id}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a className="btn-primary px-3 py-1.5 text-xs" href={`/admin/support/user/${user.id}`}>
                      Open profile
                    </a>
                    <a className="btn-secondary px-3 py-1.5 text-xs" href={`mailto:${user.email}`}>
                      Email user
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

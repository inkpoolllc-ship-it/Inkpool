"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { GhostButton } from "@/components/ui/GhostButton";
import { Button } from "@/components/ui/Button";

type PoolCard = {
  id: string;
  name: string;
  artist: { id: string; name: string; logo?: string | null; color?: string | null };
  rules: any;
  entries: number;
  createdAt: string;
};

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [rows, setRows] = useState<PoolCard[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(page = 1) {
    setLoading(true);
    const r = await fetch(`/api/explore/pools?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}`);
    const d = await r.json();
    setRows(d.pools || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [sort]);

  return (
    <div>
      <div className="mb-4">
        <a href="/dashboard" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-[color:var(--panel-border)] bg-[var(--brand)] text-[var(--brand-text,white)] hover:opacity-90 transition">← Return to Dashboard</a>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Search pools"
          className="rounded-xl bg-[#0e1318] border border-[color:var(--panel-border)] px-3 py-2"
        />
        <GhostButton onClick={()=>load()}>Search</GhostButton>
        <select value={sort} onChange={(e)=>setSort(e.target.value)}
          className="rounded-xl bg-[#0e1318] border border-[color:var(--panel-border)] px-3 py-2">
          <option value="newest">Newest</option>
          <option value="filling">Filling fast</option>
          <option value="value">Highest value</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center gap-3">
              {p.artist.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.artist.logo} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg" style={{ background: p.artist.color || "#1f2a31" }} />
              )}
              <div>
                <div className="text-sm text-[color:var(--muted)]">{p.artist.name}</div>
                <div className="text-base font-semibold">{p.name}</div>
              </div>
              <div className="ml-auto text-xs px-2 py-1 rounded-md"
                   style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}>
                {p.entries} joined
              </div>
            </div>

            <div className="mt-4 text-sm text-[color:var(--muted)]">
              Entry price {formatPrice(p.rules?.price_cents || p.rules?.price)} • Prize {formatPrice(p.rules?.prize_cents || p.rules?.prize)}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={() => joinPool(p.id)}>Join</Button>
              <GhostButton onClick={() => viewArtist(p.artist.id)}>View artist</GhostButton>
            </div>
          </Card>
        ))}
      </div>

      {loading && <div className="mt-6 text-sm text-[color:var(--muted)]">Loading…</div>}
    </div>
  );
}

function formatPrice(x: any) {
  const cents = Number(x || 0);
  if (cents >= 100) return `$${(cents/100).toFixed(0)}`;
  return `$${cents}`;
}

async function joinPool(poolId: string) {
  const r = await fetch("/api/explore/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poolId })
  });
  const d = await r.json();
  if (!r.ok) alert(d.error || "Could not join");
  else alert("Joined");
}

function viewArtist(artistId: string) {
  window.location.href = `/artist/${artistId}`;
}



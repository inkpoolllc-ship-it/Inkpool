'use client';

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GhostButton } from "@/components/ui/GhostButton";
import { Stat } from "@/components/ui/Stat";
import { HeaderBar } from "@/components/HeaderBar";
import { useState } from "react";

type ArtistOpt = { id: string; name: string };

export default function ClientPortalClient({ tokens = 0, artists = [] as ArtistOpt[] }: { tokens?: number; artists?: ArtistOpt[] }) {
  const [selectedArtist, setSelectedArtist] = useState<string>(artists[0]?.id || "");
  return (
    <div className="space-y-6">
      <HeaderBar tokens={tokens} onBuy={() => { /* reuse buy flow if needed */ }} subtitle="Client Dashboard" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Credits / deposits" value={"—"} />
        <Stat label="Tokens" value={"—"} />
        <Stat label="Wins" value={"—"} />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--brand)]">Request Appointment</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={selectedArtist} onChange={(e)=>setSelectedArtist(e.target.value)}
                  className="rounded-2xl border border-[color:var(--panel-border)] bg-[#0f1519] px-4 py-3">
            {artists.map((a)=> (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <input className="w-full rounded-2xl border border-[color:var(--panel-border)] bg-[#0f1519] px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--brand)]" placeholder="Note" />
          <Button>Use Credits</Button>
        </div>
        <div className="mt-3">
          <a href={`/artist/${selectedArtist}`}><GhostButton>View Artist Page</GhostButton></a>
        </div>
        <div className="mt-2 text-xs text-[color:var(--muted)]">Your credits apply only to the selected artist. Selecting an artist ensures deposits/credits are never mixed.</div>
      </Card>
    </div>
  );
}



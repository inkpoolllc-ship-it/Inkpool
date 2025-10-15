'use client';

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GhostButton } from "@/components/ui/GhostButton";
import { HeaderBar } from "@/components/HeaderBar";
import { Stat } from "@/components/ui/Stat";
import { CreditDrawer } from "@/components/CreditDrawer";

export default function DashboardClient({
  tokens = 0,
  logoUrl,
  facebookUrl,
  instagramUrl,
  websiteUrl,
  publicUrl,
  activePools = 0,
  totalEntries = 0,
  gross = "$0",
}: {
  tokens?: number;
  logoUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  publicUrl?: string;
  activePools?: number;
  totalEntries?: number;
  gross?: string;
}) {
  const [name, setName] = useState("");
  const [creditsOpen, setCreditsOpen] = useState(false);
  return (
    <>
      <HeaderBar tokens={tokens} onBuy={() => { /* existing buy token handler */ }} logoUrl={logoUrl} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--brand)]">Start a Pool</h2>
            {publicUrl && (
              <a href={publicUrl} className="text-sm underline">View Public Page →</a>
            )}
          </div>
          <p className="text-sm text-[#9aa6b2] mb-4">Starting a pool consumes 1 token.</p>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New pool name"
              className="w-full rounded-xl bg-[#0e1318] border border-[color:var(--panel-border)] px-4 py-3 text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
            />
            <Button onClick={() => { /* your create handler using name */ }}>Start Pool</Button>
          </div>
        </Card>

        <div className="grid gap-4">
          <div className="text-[var(--brand)]"><Stat label="Active Pools" value={activePools} /></div>
          <div className="text-[var(--brand)]"><Stat label="Total Entries" value={totalEntries} /></div>
          <div className="text-[var(--brand)]"><Stat label="Gross" value={gross} /></div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--brand)]">Pools</h3>
            <GhostButton onClick={() => { /* maybe navigate to all */ }}>View All</GhostButton>
          </div>
          <div className="text-[#9aa6b2] text-sm">No pools yet.</div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--brand)]">Requests</h3>
            <GhostButton onClick={() => { /* navigate */ }}>Manage</GhostButton>
          </div>
          <div className="text-[#9aa6b2] text-sm">No requests yet.</div>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[color:var(--muted)]">Social:</span>
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-[color:var(--panel-border)] hover:bg-white/5">Facebook</a>}
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-[color:var(--panel-border)] hover:bg-white/5">Instagram</a>}
            {websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-[color:var(--panel-border)] hover:bg-white/5">Website</a>}
            {!facebookUrl && !instagramUrl && !websiteUrl && <span className="text-xs text-[color:var(--muted)]">Add social links in Brand settings</span>}
          </div>
        </Card>
      </div>

      <CreditDrawer open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
}



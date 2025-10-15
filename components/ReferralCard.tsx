"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ReferralCard({ code }: { code: string | null }) {
  const refUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/login?ref=${code}`
    : `/login?ref=${code}`
  function copy() {
    if (!code) return
    const url = typeof window !== 'undefined' ? `${window.location.origin}/login?ref=${code}` : `/login?ref=${code}`
    navigator.clipboard?.writeText(url)
  }
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-[var(--brand)]">Refer an artist</h3>
      <p className="text-sm text-[color:var(--muted)] mb-3">Get 1 free token when they buy their first token.</p>
      <div className="flex gap-2 items-center">
        <input readOnly value={refUrl} className="w-full rounded-xl bg-[#0e1318] border border-[color:var(--panel-border)] px-3 py-2 text-[color:var(--ink)]" />
        <Button onClick={copy}>Copy</Button>
      </div>
    </Card>
  )
}



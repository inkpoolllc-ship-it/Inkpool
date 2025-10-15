import { Badge } from "./ui/Badge";
import { GhostButton } from "./ui/GhostButton";

export function HeaderBar({ tokens, onBuy, logoUrl, subtitle = "Artist Dashboard" }:{tokens:number; onBuy:()=>void; logoUrl?: string; subtitle?: string}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold leading-none text-[var(--brand)]">Ink Pool</h1>
          {logoUrl ? (
            // small, clean logo next to title
            <img src={logoUrl} alt="logo" className="h-10 w-auto object-contain rounded-md" />
          ) : null}
        </div>
        <div className="mt-1 text-sm text-white">{subtitle}</div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Badge>Tokens: {tokens}</Badge>
        <GhostButton onClick={onBuy}>Buy Token</GhostButton>
        <a href="/explore" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-[color:var(--panel-border)] bg-[var(--brand)] text-[var(--brand-text,white)] hover:opacity-90 transition">Explore</a>
        <a href="/dashboard/about" className="inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium border border-[color:var(--panel-border)] bg-[var(--brand)] text-[var(--brand-text,white)] hover:opacity-90 transition">About</a>
      </div>
    </div>
  );
}



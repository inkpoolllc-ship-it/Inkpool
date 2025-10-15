import { createServerClient } from "@supabase/ssr";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function ArtistPublicPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );

  const { data: artist } = await supabase
    .from('artists')
    .select('id,name,logo_url,brand_color,facebook_url,instagram_url,website_url')
    .eq('id', params.id)
    .single();

  if (!artist) return <div className="p-6">Artist not found.</div>;

  const { data: pools } = await supabase
    .from('pools')
    .select('id,name,rules,status,created_at')
    .eq('artist_id', params.id)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  const brand = artist.brand_color || '#10b981';

  return (
    <div className="space-y-6" style={{ ['--brand' as any]: brand } as React.CSSProperties}>
      <div className="flex items-center gap-3">
        {artist.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.logo_url} alt="logo" className="h-10 w-10 rounded-md object-contain" />
        ) : (
          <div className="h-10 w-10 rounded-md bg-[var(--brand)]" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand)]">{artist.name || 'Artist'}</h1>
          <div className="text-sm text-[color:var(--muted)]">Open pools and info</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {artist.facebook_url && (
            <a href={artist.facebook_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-[color:var(--panel-border)] hover:bg-white/5">Facebook</a>
          )}
          {artist.instagram_url && (
            <a href={artist.instagram_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-[color:var(--panel-border)] hover:bg-white/5">Instagram</a>
          )}
          {artist.website_url && (
            <a href={artist.website_url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-md border border-[color:var(--panel-border)] hover:bg-white/5">Website</a>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(pools || []).map((p: any) => (
          <Card key={p.id} className="p-5">
            <div className="text-base font-semibold">{p.name}</div>
            <div className="mt-1 text-sm text-[color:var(--muted)]">
              Entry {formatPrice(p.rules?.price_cents || p.rules?.price)} · Prize {formatPrice(p.rules?.prize_cents || p.rules?.prize)}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a href={`/join?artist=${artist.id}&pool=${p.id}`}><Button>Join</Button></a>
            </div>
          </Card>
        ))}
        {(pools || []).length === 0 && <div className="text-sm text-[color:var(--muted)]">No open pools right now.</div>}
      </div>
    </div>
  )
}

function formatPrice(x: any) {
  const cents = Number(x || 0);
  return `$${(cents/100).toFixed(0)}`;
}



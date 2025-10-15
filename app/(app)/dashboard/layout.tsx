import { createServerClient } from "@supabase/ssr";
import Image from "next/image";

async function getArtist() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: () => undefined as any, set: () => {}, remove: () => {} } as any }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("artists")
    .select("name, brand_color, logo_url, pool_tokens")
    .eq("id", user.id)
    .single();
  return data as any;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const artist = await getArtist();
  const brand = (artist?.brand_color as string) ?? "#10b981";
  return (
    <div id="dashboard-root"
      style={{
        ['--brand' as any]: brand,
        ['--brand-hover' as any]: brand,
      } as React.CSSProperties}
    >
      <div className="mb-6 flex items-center gap-3">
        {artist?.logo_url ? (
          <Image src={artist.logo_url} alt="logo" width={32} height={32} className="rounded-lg" />
        ) : (
          <span className="text-2xl font-extrabold">Ink Pool</span>
        )}
        <span className="text-sm text-[color:var(--muted)]">Artist Dashboard</span>
      </div>
      {children}
    </div>
  );
}



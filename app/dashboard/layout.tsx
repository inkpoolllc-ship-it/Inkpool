import { createServerClient } from "@supabase/ssr";

async function getArtist() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null as any;
  const { data } = await supabase
    .from("artists")
    .select("brand_color, logo_url, name, pool_tokens")
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
      {children}
    </div>
  );
}



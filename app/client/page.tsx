import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import OnboardOnMount from '@/components/OnboardOnMount'
import ClientPortalClient from './page.client'
import { BrandSettingsClient } from './BrandSettingsClient'

export default async function ClientPortal() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return (
      <div className="p-6">
        <a className="underline" href="/login">Sign in</a>
      </div>
    )
  }
  const supabase = await getServerSupabase()
  // For MVP, show simple aggregates
  const { data: pools } = await supabase.from('pools').select('id,name').order('created_at', { ascending: false })
  const { data: wins } = await supabase.from('winners').select('id, pool_id, prize_cents').order('created_at', { ascending: false })
  const { data: credits } = await supabase.from('credits_ledger').select('delta_cents').order('created_at', { ascending: false })
  const { data: tokens } = await supabase.from('tokens_ledger').select('delta').order('created_at', { ascending: false })
  const creditBalance = (credits ?? []).reduce((sum: number, r: any) => sum + (r.delta_cents || 0), 0)
  const tokenBalance = (tokens ?? []).reduce((sum: number, r: any) => sum + (r.delta || 0), 0)

  // Fetch artists this client has profiles with (via customers)
  const { data: customerArtists } = await supabase
    .from('customers')
    .select('artist_id, artists:artist_id(id,name,facebook_url,instagram_url,website_url,logo_url,brand_color)')
    .eq('email', user.email as any)
  const artists = (customerArtists ?? [])
    .map((r: any) => ({
      id: r.artists?.id || r.artist_id,
      name: r.artists?.name || 'Artist',
      facebook: r.artists?.facebook_url || undefined,
      instagram: r.artists?.instagram_url || undefined,
      website: r.artists?.website_url || undefined,
      logo: r.artists?.logo_url || undefined,
      color: r.artists?.brand_color || undefined,
    }))
    .filter((a: any) => a.id)
    .reduce((acc: any[], a: any) => (acc.find(x => x.id === a.id) ? acc : acc.concat(a)), [] as any[])

  return (
    <div className="space-y-6">
      <OnboardOnMount />
      <ClientPortalClient tokens={tokenBalance} artists={artists} />
      <BrandSettingsClient brand={undefined} refCode={(user.id || '').slice(0,8)} />
    </div>
  )
}



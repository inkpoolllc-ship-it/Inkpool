import { getAuthenticatedUser, getServerSupabase } from '@/lib/supabaseServer'
import OnboardOnMount from '@/components/OnboardOnMount'
import DashboardClient from './page.client'
import { BrandSettings } from './brand-settings'
import { ReferralCard } from '@/components/ReferralCard'

export default async function DashboardPage() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return (
      <div className="p-6">
        <a className="underline" href="/login">Sign in</a>
      </div>
    )
  }
  const supabase = getServerSupabase()
  // Auto-onboard: ensure artist row exists with 1 initial token
  let { data: artist } = await supabase.from('artists').select('pool_tokens, logo_url, facebook_url, instagram_url, website_url, brand_color').eq('id', user.id).maybeSingle()
  if (!artist) {
    await supabase.from('artists').insert({ id: user.id, email: user.email, pool_tokens: 1 })
    const refreshed = await supabase.from('artists').select('pool_tokens').eq('id', user.id).single()
    artist = refreshed.data as any
  }
  const { data: pools } = await supabase.from('pools').select('id,name,status,created_at').order('created_at', { ascending: false })
  const { data: requests } = await supabase.from('requests').select('id,kind,status,when_text,created_at').order('created_at', { ascending: false })

  // Simple analytics
  const { count: activePoolsCount } = await supabase.from('pools').select('id', { count: 'exact', head: true }).eq('artist_id', user.id).eq('status', 'open')
  const { data: entrySums } = await supabase.from('entries').select('amount_cents, pool_id').in('pool_id', (pools||[]).map((p:any)=>p.id))
  const totalEntriesCount = (entrySums||[]).length
  const grossCents = (entrySums||[]).reduce((sum:number,r:any)=> sum + (r.amount_cents||0), 0)

  return (
    <>
      <OnboardOnMount />
      <DashboardClient
        tokens={artist?.pool_tokens ?? 0}
        logoUrl={artist?.logo_url ?? undefined}
        facebookUrl={artist?.facebook_url ?? undefined}
        instagramUrl={artist?.instagram_url ?? undefined}
        websiteUrl={artist?.website_url ?? undefined}
        publicUrl={`/artist/${user.id}`}
        activePools={activePoolsCount ?? 0}
        totalEntries={totalEntriesCount}
        gross={`$${(grossCents/100).toFixed(0)}`}
      />
      <div className="mt-6">
        <ReferralCard code={(user.id || '').slice(0,8)} />
      </div>
      <div className="mt-8">
        <BrandSettings
          currentColor={artist?.brand_color || undefined}
          currentLogo={artist?.logo_url || undefined}
          facebook={artist?.facebook_url || undefined}
          instagram={artist?.instagram_url || undefined}
          website={artist?.website_url || undefined}
        />
      </div>
    </>
  )
}
<div className="p-6 bg-[#0b0c0c] text-white rounded-2xl mt-6">
  tailwind is working
</div>



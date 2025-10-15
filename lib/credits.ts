import { createServerClient } from "@supabase/ssr";

export async function getCreditBalances() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(){}, set(){}, remove(){} } as any }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as any[];

  const { data, error } = await supabase
    .from("credits_ledger")
    .select("customer_id, customers:customer_id(id,name,handle,email), delta_cents, created_at")
    .gte("delta_cents", 0)
    .order("created_at", { ascending: false });

  if (error || !data) return [] as any[];

  const byCustomer = new Map<string, { id: string; name: string | null; handle: string | null; email: string | null; cents: number }>();
  for (const row of data as any[]) {
    const key = row.customer_id as string;
    if (!key) continue;
    if (!byCustomer.has(key)) {
      byCustomer.set(key, {
        id: key,
        name: row.customers?.name ?? null,
        handle: row.customers?.handle ?? null,
        email: row.customers?.email ?? null,
        cents: 0,
      });
    }
    const entry = byCustomer.get(key)!;
    entry.cents += row.delta_cents || 0;
  }
  return Array.from(byCustomer.values()).filter((x) => x.cents > 0);
}



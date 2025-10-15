"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

export default function JoinPage() {
  const [data, setData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const artist = params.get("artist") || "";
  const pool = params.get("pool") || "";
  const ref = params.get("ref") || "";

  useEffect(() => {
    fetch(`/api/join/preview?artist=${artist}${pool ? `&pool=${pool}` : ""}`)
      .then(r => r.json()).then(setData);
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [artist, pool]);

  async function signIn() {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=` +
          encodeURIComponent(`/join/landing?artist=${artist}${pool ? `&pool=${pool}` : ""}${ref ? `&ref=${ref}` : ""}`)
      },
    });
    alert("Check your email for the sign-in link.");
  }

  async function joinNow() {
    if (!pool) return;
    const r = await fetch("/api/explore/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ poolId: pool, refCode: ref || undefined })
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Could not join");
    alert("You’re in. Good luck.");
    window.location.href = "/client";
  }

  const artistName = data?.artist?.name || "Artist";
  const logo = data?.artist?.logo_url;
  const activePool = data?.pool;
  const openPools = data?.openPools || [];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="flex items-center gap-3">
        {logo ? <img src={logo} className="h-10 w-10 rounded-md" alt="" /> : <div className="h-10 w-10 rounded-md bg-gray-700" />}
        <div>
          <h1 className="text-2xl font-bold">Join {artistName}</h1>
          <div className="text-sm text-gray-400">Pick a pool and get in</div>
        </div>
      </div>

      {activePool ? (
        <div className="mt-6 rounded-2xl border border-gray-700 p-5">
          <div className="text-lg font-semibold">{activePool.name}</div>
          <div className="mt-1 text-sm text-gray-400">
            Entry price {formatPrice(activePool.rules?.price_cents || activePool.rules?.price)} ·
            Prize {formatPrice(activePool.rules?.prize_cents || activePool.rules?.prize)}
          </div>
          <div className="mt-4">
            {user ? (
              <button onClick={joinNow} className="rounded-xl px-4 py-2 font-semibold bg-emerald-500 text-black">Join</button>
            ) : (
              <div className="flex gap-2">
                <input className="rounded-xl border border-gray-700 bg-black/30 px-3 py-2"
                       placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
                <button onClick={signIn} className="rounded-xl px-4 py-2 font-semibold bg-emerald-500 text-black">Sign in to join</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="text-sm text-gray-400 mb-2">Choose a pool</div>
          <div className="grid gap-4">
            {openPools.map((p:any) => (
              <a key={p.id} href={`/join?artist=${artist}&pool=${p.id}${ref ? `&ref=${ref}` : ""}`}
                 className="rounded-xl border border-gray-700 p-4 hover:bg-white/5">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-400">
                  Entry {formatPrice(p.rules?.price_cents || p.rules?.price)}
                  {" "}· Prize {formatPrice(p.rules?.prize_cents || p.rules?.prize)}
                </div>
              </a>
            ))}
            {openPools.length === 0 && <div className="text-sm text-gray-400">No open pools right now.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function formatPrice(x:any) {
  const cents = Number(x || 0);
  return `$${(cents/100).toFixed(0)}`;
}



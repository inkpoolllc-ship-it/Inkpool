'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    // preserve referral code from URL (?ref=XXXX) into cookie before redirect
    const url = new URL(window.location.href);
    const ref = url.searchParams.get('ref');
    if (ref) {
      document.cookie = `ref=${ref}; path=/; max-age=${60*60*24*30}`;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 👇 this sends users to your callback route
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect=%2Fdashboard`,
      },
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h3>Sign in via Magic Link</h3>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: '100%', padding: 10, margin: '12px 0' }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: 10 }}>Send Link</button>
      </form>
      {sent && <p>Check your email for the link.</p>}
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </div>
  );
}

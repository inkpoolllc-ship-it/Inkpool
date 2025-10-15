'use client';
import { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemePills } from "@/components/ThemePills";

export function BrandSettings({ currentColor = "#10b981", currentLogo = "", facebook = "", instagram = "", website = "" }: { currentColor?: string; currentLogo?: string; facebook?: string; instagram?: string; website?: string }) {
  const [brand, setBrand] = useState(currentColor);
  const [logo, setLogo] = useState(currentLogo);
  const [preview, setPreview] = useState(currentLogo);
  const [facebookUrl, setFacebookUrl] = useState(facebook);
  const [instagramUrl, setInstagramUrl] = useState(instagram);
  const [websiteUrl, setWebsiteUrl] = useState(website);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function save() {
    await fetch("/api/artist/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_color: brand, logo_url: logo, facebook_url: facebookUrl, instagram_url: instagramUrl, website_url: websiteUrl }),
    });
    location.reload();
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-3 text-[var(--brand)]">Theme color</h3>
      <div className="grid gap-4">
        <div>
          <div className="text-sm text-[color:var(--muted)] mb-1">Theme color</div>
          <ThemePills initial={brand} />
        </div>
        <div>
          <div className="text-sm text-[color:var(--muted)] mb-1">Logo</div>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const form = new FormData()
              form.append('file', f)
              const res = await fetch('/api/artist/logo', { method: 'POST', body: form })
              const d = await res.json()
              if (d?.url) {
                setLogo(d.url)
                setPreview(d.url)
              }
            }} />
            <Button onClick={() => fileRef.current?.click()}>Upload Logo</Button>
            {preview && <img src={preview} alt="logo" className="h-10 w-10 rounded-lg border border-[color:var(--panel-border)]" />}
          </div>
        </div>
        <div>
          <div className="text-sm text-[color:var(--muted)] mb-1">Social links</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={facebookUrl} onChange={(e)=>setFacebookUrl(e.target.value)} placeholder="Facebook URL" className="rounded-xl border border-[color:var(--panel-border)] px-3 py-2 bg-[#f6f9fc]" />
            <input value={instagramUrl} onChange={(e)=>setInstagramUrl(e.target.value)} placeholder="Instagram URL" className="rounded-xl border border-[color:var(--panel-border)] px-3 py-2 bg-[#f6f9fc]" />
            <input value={websiteUrl} onChange={(e)=>setWebsiteUrl(e.target.value)} placeholder="Website" className="rounded-xl border border-[color:var(--panel-border)] px-3 py-2 bg-[#f6f9fc]" />
          </div>
        </div>
      </div>
      {/* Auto-saved via ThemePills; keep Save for logo/social changes */}
      <div className="mt-4"><Button onClick={save}>Save</Button></div>
    </Card>
  );
}



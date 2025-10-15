'use client';
import { Card } from "@/components/ui/Card";
import { ThemePills } from "@/components/ThemePills";
import { ReferralCard } from "@/components/ReferralCard";

export function BrandSettingsClient({ brand, refCode }: { brand?: string; refCode?: string }) {
  return (
    <div className="grid gap-6">
      <ReferralCard code={refCode || null} />
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-3 text-[var(--brand)]">Theme color</h3>
        <ThemePills initial={brand} showSave={false} />
      </Card>
    </div>
  );
}



"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Pale", value: "#ECE8CD" },
  { name: "Red", value: "#D20103" },
  { name: "Orange", value: "#F19500" },
  { name: "Gold", value: "#D0AB28" },
  { name: "Yellow", value: "#FBFF03" },
  { name: "Green", value: "#00BD00" },
  { name: "Teal", value: "#1E6654" },
  { name: "Cyan", value: "#2CEBFD" },
  { name: "Lavender", value: "#C597FC" },
  { name: "Pink", value: "#FFC3F0" },
  { name: "Magenta", value: "#DC04A7" },
];

export function ThemePills({ initial, showSave = true }: { initial?: string; showSave?: boolean }) {
  const [selected, setSelected] = useState<string>(initial || "#22c55e");

  function apply(color: string) {
    setSelected(color);
    const root = document.getElementById('dashboard-root');
    const html = document.documentElement;
    (root || html).style.setProperty("--brand", color);
    (root || html).style.setProperty("--brand-hover", color);
    // also set on html to ensure subroutes inherit immediately
    html.style.setProperty("--brand", color);
    html.style.setProperty("--brand-hover", color);
    const hex = color.replace('#','');
    const r = parseInt(hex.substring(0,2),16);
    const g = parseInt(hex.substring(2,4),16);
    const b = parseInt(hex.substring(4,6),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b);
    // Force dark text for specific light colors
    const forceDark = ["#FFFFFF","#ECE8CD","#FBFF03","#FFC3F0","#2CEBFD","#D0AB28","#F19500","#D20103","#00BD00"].includes(color.toUpperCase());
    const contrast = forceDark || luminance > 200 ? '#0b1b20' : '#ffffff';
    (root || html).style.setProperty("--brand-text", contrast);
    html.style.setProperty("--brand-text", contrast);
    try {
      localStorage.setItem("brand", color);
      localStorage.setItem("brandText", contrast);
    } catch {}
    // Auto-save brand color for artists
    fetch("/api/artist/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_color: color }),
    }).catch(()=>{});
  }

  async function save() {
    await fetch("/api/artist/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand_color: selected }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button
            key={c.value}
            onClick={() => apply(c.value)}
            className={`h-8 w-8 rounded-full border ${selected === c.value ? "ring-2 ring-[color:var(--brand)]" : ""}`}
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
      </div>
      {showSave && <Button onClick={save}>Save Theme</Button>}
    </div>
  );
}



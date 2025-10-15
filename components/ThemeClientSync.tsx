"use client";
import { useEffect } from "react";

export function ThemeClientSync() {
  useEffect(() => {
    try {
      const color = localStorage.getItem("brand");
      const text = localStorage.getItem("brandText");
      if (color) {
        const root = document.getElementById('dashboard-root');
        const html = document.documentElement;
        (root || html).style.setProperty("--brand", color);
        (root || html).style.setProperty("--brand-hover", color);
        html.style.setProperty("--brand", color);
        html.style.setProperty("--brand-hover", color);
      }
      if (text) {
        const root = document.getElementById('dashboard-root');
        const html = document.documentElement;
        (root || html).style.setProperty("--brand-text", text);
        html.style.setProperty("--brand-text", text);
      }
    } catch {}
  }, []);
  return null;
}



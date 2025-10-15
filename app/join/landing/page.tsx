"use client";
import { useEffect } from "react";

export default function JoinLanding() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pool = params.get("pool");
    const ref = params.get("ref") || undefined;
    async function go() {
      if (!pool) { window.location.href = "/client"; return; }
      const r = await fetch("/api/explore/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId: pool, refCode: ref })
      });
      if (r.ok) window.location.href = "/client";
      else {
        const d = await r.json();
        alert(d.error || "Could not join");
        window.location.href = "/client";
      }
    }
    go();
  }, []);
  return <div className="p-8 text-sm text-gray-400">Finalizing your entry…</div>;
}



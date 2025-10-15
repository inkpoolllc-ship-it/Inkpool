"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Balance = { id: string; name: string | null; handle: string | null; email: string | null; cents: number };
type Msg = { id: string; sender: "artist" | "client"; body: string; created_at: string };

export function CreditDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Balance[]>([]);
  const [active, setActive] = useState<Balance | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/credits").then(r => r.json()).then(d => {
      setRows(d.balances || []);
    }).finally(() => setLoading(false));
  }, [open]);

  async function openChat(r: Balance) {
    setActive(r);
    const res = await fetch(`/api/messages?customerId=${r.id}`);
    const d = await res.json();
    setThread(d.messages || []);
  }

  async function send() {
    if (!active || !text.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: active.id, text })
    });
    setThread(prev => [...prev, { id: String(Date.now()), sender: "artist", body: text, created_at: new Date().toISOString() }]);
    setText("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-[color:var(--panel)] border-l border-[color:var(--panel-border)] p-6 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Client credits</h2>
          <button onClick={onClose} className="text-sm text-[color:var(--muted)]">Close</button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <div className="mb-3 text-sm text-[color:var(--muted)]">{loading ? "Loading..." : "Clients with positive credit"}</div>
            <div className="divide-y divide-[color:var(--panel-border)]">
              {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{r.name || r.handle || r.email || "Client"}</div>
                    <div className="text-xs text-[color:var(--muted)]">{r.email || r.handle || ""}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">${(r.cents / 100).toFixed(2)}</div>
                    <Button onClick={() => openChat(r)}>Contact</Button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && <div className="py-6 text-sm text-[color:var(--muted)]">No client credits yet</div>}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3">
              <div className="text-sm text-[color:var(--muted)]">Conversation</div>
              <div className="text-lg font-bold">{active ? (active.name || active.handle || active.email) : "Select a client"}</div>
            </div>
            <div className="h-80 overflow-y-auto rounded-xl border border-[color:var(--panel-border)] p-3 bg-[#0e1318]">
              {thread.map(m => (
                <div key={m.id} className={`mb-2 ${m.sender === "artist" ? "text-right" : "text-left"}`}>
                  <span className={`inline-block rounded-xl px-3 py-2 ${m.sender === "artist" ? "bg-[color:var(--brand)] text-[#06130f]" : "bg-[#161c22] text-[color:var(--ink)]"}`}>
                    {m.body}
                  </span>
                </div>
              ))}
              {thread.length === 0 && <div className="text-sm text-[color:var(--muted)]">No messages yet</div>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message"
                className="w-full rounded-xl bg-[#0e1318] border border-[color:var(--panel-border)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]"
              />
              <Button onClick={send}>Send</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}



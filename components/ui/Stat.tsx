export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[color:var(--panel-border)] bg-[#10161a] p-4">
      <div className="text-xs text-[color:var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
    </div>
  );
}



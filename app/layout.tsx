import "./globals.css";
import { ReactNode } from "react";
import { display, body } from "./fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      {/* brand + theme fallbacks via CSS vars */}
      <body
        style={
          {
            // defaults (overridden per-artist below)
            ['--brand' as any]: '#0ea77a',
            ['--brand-hover' as any]: '#0b8964',
            ['--ink' as any]: '#f3f6f8',
            ['--muted' as any]: '#94a3b8',
            ['--panel' as any]: '#12161b',
            ['--panel-border' as any]: '#1f2a31',
            ['--bg-top' as any]: '#0b0e11',
            ['--bg-bottom' as any]: '#0d1115',
          } as React.CSSProperties
        }
        className="min-h-screen bg-[linear-gradient(180deg,var(--bg-top),var(--bg-bottom))] text-[var(--ink)] antialiased"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</div>
      </body>
    </html>
  );
}

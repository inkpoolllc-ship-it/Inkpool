import { Card } from "@/components/ui/Card";
import { GhostButton } from "@/components/ui/GhostButton";
import { ThemeClientSync } from "@/components/ThemeClientSync";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <ThemeClientSync />
      <div>
        <a href="/dashboard"><GhostButton>← Back to Dashboard</GhostButton></a>
      </div>
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-[var(--brand)]">About Ink Pool</h1>
        <p className="mt-3 text-[color:var(--muted)]">
          Ink Pool makes getting tattooed fun, fair, and exciting. It’s built like a community pool where every entry helps someone move closer to their tattoo goals. You have a real chance to win, but even when you don’t, your money stays yours as credit with your artist.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--brand)]">How it works</h2>
        <p className="mt-3 text-[color:var(--muted)]">
          An artist opens a pool for a set value amount. You join with a small buy-in. Once it fills, a winner is chosen. They get the main tattoo or credit prize. Everyone else keeps their money as credit toward their next tattoo. No fine print, just a good time that always pays it forward.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--brand)]">Why we built it</h2>
        <p className="mt-3 text-[color:var(--muted)]">
          Ink Pool was created to make tattoo promotions exciting again. It’s a fun way for artists and clients to connect, support each other, and turn creativity into something everyone can be part of. You have high odds of winning a great tattoo, and even higher odds of helping someone else get closer to theirs. It’s a win for everyone involved.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--brand)]">What we stand for</h2>
        <ul className="mt-3 space-y-2 text-[color:var(--muted)] list-disc pl-5">
          <li>We stand for community, creativity, and connection.</li>
          <li>We believe tattooing should always feel exciting and fair.</li>
          <li>We believe in clear rules, real odds, and good energy.</li>
          <li>We believe in artists and clients growing together through trust and fun.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--brand)]">For clients</h2>
        <p className="mt-3 text-[color:var(--muted)]">
          You can view and join pools directly from your dashboard, track your credits, and use them toward future tattoos. The Explore tab lets you explore pools from other artists too, so there’s always something new to get excited about.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-[var(--brand)]">Our promise</h2>
        <p className="mt-3 text-[color:var(--muted)]">
          Ink Pool keeps it simple, transparent, and fun. Every rule is clear, every pool is fair, and every contribution helps your favorite artists keep doing what they love.
        </p>
      </Card>
    </div>
  );
}



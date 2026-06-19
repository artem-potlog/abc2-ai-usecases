import { teaserCases } from "./data/teaser";

function criticalityClass(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("critical")) return "bg-rose-500/20 text-rose-300 border-rose-500/40";
  if (l.includes("very high")) return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  if (l.includes("high")) return "bg-orange-500/15 text-orange-300 border-orange-500/30";
  if (l.includes("medium")) return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  if (l.includes("low")) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  return "bg-slate-500/15 text-slate-300 border-slate-500/30";
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LockedCard({ c }: { c: (typeof teaserCases)[number] }) {
  return (
    <div
      aria-label={`Locked use case ${c.id}`}
      className="relative select-none cursor-not-allowed rounded-2xl border border-border bg-panel p-5 shadow-lg shadow-black/20"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-accent-2">{c.id}</span>
        <span
          className={`text-[10px] uppercase tracking-wider border rounded-full px-2 py-0.5 ${criticalityClass(c.riskLevel)}`}
        >
          {c.riskLevel}
        </span>
      </div>

      <div className="mt-2 text-xs text-muted">
        {c.domain} · {c.deployment}
      </div>

      {/* Hidden content placeholder (decorative only) + lock overlay */}
      <div className="relative mt-4">
        <div className="pointer-events-none space-y-3 opacity-50 blur-[5px]" aria-hidden="true">
          <div className="h-5 w-2/3 rounded bg-white/15" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded bg-white/10" />
            <div className="h-2.5 w-11/12 rounded bg-white/10" />
            <div className="h-2.5 w-4/5 rounded bg-white/10" />
          </div>
          <div className="flex gap-1.5 pt-1">
            <div className="h-4 w-16 rounded-md bg-white/10" />
            <div className="h-4 w-12 rounded-md bg-white/10" />
            <div className="h-4 w-14 rounded-md bg-white/10" />
          </div>
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg/70 px-4 py-3 backdrop-blur-sm">
            <LockIcon className="h-5 w-5 text-accent-2" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-full bg-bg text-text">
      <header className="border-b border-border bg-panel/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 grid place-items-center font-bold text-white text-sm">
              A
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-white tracking-tight">
                Company ABC · AI Workflow Simulations
              </div>
              <div className="text-xs text-muted">Locked preview</div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted">
            <LockIcon className="h-3.5 w-3.5" />
            Private
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="pb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
            AI Workflow Simulations
          </h1>
          <p className="mt-4 text-muted max-w-3xl">
            Interactive walkthroughs of how AI agents operate across Company ABC's
            business functions. The full simulations are private — this is a locked
            preview showing the breadth of the portfolio only.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Use cases" value={String(teaserCases.length)} />
            <Stat label="AI platforms integrated" value="26+" />
            <Stat label="Avg. process speed gain" value="~10×" />
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3 text-sm text-muted">
            <LockIcon className="h-4 w-4 flex-shrink-0 text-accent-2" />
            <span>
              The full interactive version is available on request. Contact via{" "}
              <a
                href="https://artempotlog.com/#contact"
                className="text-accent-2 underline underline-offset-4 hover:text-white transition"
              >
                artempotlog.com
              </a>
              .
            </span>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Use cases</h2>
            <span className="text-xs text-muted">Locked · preview only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teaserCases.map((c) => (
              <LockedCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border-soft mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-muted">
          Full interactive simulations are private. Available on request.
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel px-5 py-4">
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted mt-1">{label}</div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useCases } from "../data/useCases";
import type { UseCase } from "../data/types";

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CardInner({ uc }: { uc: UseCase }) {
  const steps = uc.locked ? uc.stepsCount ?? 0 : uc.workflow.length;
  const scenarios = uc.locked ? uc.scenarioCount ?? 0 : uc.scenarios?.length ?? 0;
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-accent-2">{uc.id}</span>
        <span
          className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider border rounded-full px-2 py-0.5 ${
            uc.locked
              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
              : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          }`}
        >
          {uc.locked && <LockIcon className="h-3 w-3" />}
          {uc.locked ? "Locked" : "Unlocked"}
        </span>
      </div>

      <div
        className={`mt-3 font-semibold text-lg ${uc.locked ? "text-white" : "text-white group-hover:text-accent-2 transition"}`}
      >
        {uc.title}
      </div>
      <div className="text-xs text-muted mt-1">
        {uc.domain} · {uc.deployment}
      </div>

      <p className="text-sm text-text/80 mt-4 line-clamp-3">{uc.description}</p>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div>
          <div className="text-muted">Time saved</div>
          <div className="text-white font-medium">{uc.timeSaved}</div>
        </div>
        <div>
          <div className="text-muted">Steps</div>
          <div className="text-white font-medium">{steps}</div>
        </div>
        <div>
          <div className="text-muted">Scenarios</div>
          <div className="text-white font-medium">{scenarios}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {uc.tools.slice(0, 4).map((t) => (
          <span
            key={t}
            className="text-[10px] rounded-md border border-border bg-panel-2 px-2 py-0.5 text-text/80"
          >
            {t}
          </span>
        ))}
        {uc.tools.length > 4 && (
          <span className="text-[10px] text-muted px-1">+{uc.tools.length - 4} more</span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border-soft text-xs">
        {uc.locked ? (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <LockIcon className="h-3.5 w-3.5" />
            Full simulation locked
          </span>
        ) : (
          <span className="text-accent-2 group-hover:underline">Open simulation →</span>
        )}
      </div>
    </>
  );
}

export default function HomePage() {
  const unlocked = useCases.filter((u) => !u.locked).length;
  return (
    <div>
      <section className="pb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
          AI Workflow Simulations
        </h1>
        <p className="mt-4 text-muted max-w-3xl">
          Interactive walkthroughs of how AI agents operate across Company ABC's
          business functions. {unlocked} use cases are open to explore; the rest are
          available on request.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Use cases" value={String(useCases.length)} />
          <Stat label="AI platforms integrated" value="26+" />
          <Stat label="Avg. process speed gain" value="~10×" />
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3 text-sm text-muted">
          <LockIcon className="h-4 w-4 flex-shrink-0 text-accent-2" />
          <span>
            To unlock the full interactive version, get in touch via{" "}
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
          <span className="text-xs text-muted">Open cards are clickable · locked cards are previews</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc) =>
            uc.locked ? (
              <div
                key={uc.id}
                aria-label={`${uc.title} (locked)`}
                className="relative cursor-not-allowed select-none rounded-2xl border border-border bg-panel/70 p-5 flex flex-col shadow-lg shadow-black/20"
              >
                <CardInner uc={uc} />
              </div>
            ) : (
              <Link
                key={uc.id}
                to={`/uc/${uc.id}`}
                className="group rounded-2xl border border-border bg-panel hover:bg-panel-2 transition shadow-lg shadow-black/20 p-5 flex flex-col"
              >
                <CardInner uc={uc} />
              </Link>
            ),
          )}
        </div>
      </section>
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

import { useEffect, useMemo, useRef, useState } from "react";
import type { StepType, WorkflowStep } from "../data/types";
import { WidgetView } from "./Widget";

const stepBadge: Record<StepType, string> = {
  orchestration: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  "data-pull": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  analysis: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  generation: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  review: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  compliance: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const stepLabel: Record<StepType, string> = {
  orchestration: "Orchestration",
  "data-pull": "Data Pull",
  analysis: "AI Analysis",
  generation: "Generation",
  review: "Review",
  compliance: "Compliance",
};

type Expand = "auto" | "open" | "closed";

export function WorkflowSimulation({
  steps,
  heading = "Workflow simulation",
  accent = "default",
}: {
  steps: WorkflowStep[];
  heading?: string;
  accent?: "default" | "scenario";
}) {
  const [completed, setCompleted] = useState(0);
  const [running, setRunning] = useState(false);
  const [override, setOverride] = useState<Record<string, Expand>>({});
  const timer = useRef<number | null>(null);

  const total = steps.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    setCompleted(0);
    setRunning(false);
    setOverride({});
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, [steps]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  function stepOnce() {
    setCompleted((c) => Math.min(c + 1, total));
  }
  function runFull() {
    if (running) return;
    setRunning(true);
    setCompleted(0);
    setOverride({});
    let i = 0;
    timer.current = window.setInterval(() => {
      i += 1;
      setCompleted(i);
      if (i >= total) {
        if (timer.current) window.clearInterval(timer.current);
        timer.current = null;
        setRunning(false);
      }
    }, 700);
  }
  function reset() {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setRunning(false);
    setCompleted(0);
    setOverride({});
  }

  function toggleStep(id: string, defaultOpen: boolean) {
    setOverride((prev) => {
      const current = prev[id] ?? "auto";
      let next: Expand;
      if (current === "auto") next = defaultOpen ? "closed" : "open";
      else next = current === "open" ? "closed" : "open";
      return { ...prev, [id]: next };
    });
  }

  function expandAll() {
    const o: Record<string, Expand> = {};
    for (const s of steps) o[s.id] = "open";
    setOverride(o);
  }
  function collapseAll() {
    const o: Record<string, Expand> = {};
    for (const s of steps) o[s.id] = "closed";
    setOverride(o);
  }

  const accentBar =
    accent === "scenario"
      ? "from-rose-500 to-amber-400"
      : "from-accent to-accent-2";

  const expandedCount = useMemo(() => {
    let n = 0;
    for (let i = 0; i < steps.length; i++) {
      const id = steps[i].id;
      const done = i < completed;
      const ov = override[id] ?? "auto";
      const open = ov === "open" || (ov === "auto" && done);
      if (open) n++;
    }
    return n;
  }, [steps, completed, override]);

  return (
    <section className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{heading}</h2>
          <div className="text-xs text-muted mt-1">
            {completed} / {total} steps · {pct}% · {expandedCount} expanded
          </div>
        </div>
        <div className="flex gap-2 text-sm flex-wrap">
          <button
            onClick={collapseAll}
            className="px-2 py-1.5 rounded-md border border-border bg-panel-2 text-muted hover:text-white"
            title="Collapse all steps"
          >
            ⊟
          </button>
          <button
            onClick={expandAll}
            className="px-2 py-1.5 rounded-md border border-border bg-panel-2 text-muted hover:text-white"
            title="Expand all steps"
          >
            ⊞
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 rounded-md border border-border bg-panel-2 hover:text-white"
          >
            Reset
          </button>
          <button
            onClick={runFull}
            disabled={running}
            className="px-3 py-1.5 rounded-md border border-accent bg-accent/20 text-white hover:bg-accent/30 disabled:opacity-50"
          >
            {running ? "Running…" : "Run full workflow"}
          </button>
          <button
            onClick={stepOnce}
            disabled={running || completed >= total}
            className="px-3 py-1.5 rounded-md border border-border bg-panel-2 hover:text-white disabled:opacity-50"
          >
            Next step →
          </button>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full bg-panel-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${accentBar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((step, i) => {
          const done = i < completed;
          const ov = override[step.id] ?? "auto";
          const expanded = ov === "open" || (ov === "auto" && done);
          const active = i === completed && !done;
          return (
            <li
              key={step.id}
              className={`rounded-xl border transition ${
                done
                  ? accent === "scenario"
                    ? "border-rose-400/30 bg-rose-500/5"
                    : "border-accent/40 bg-accent/5"
                  : "border-border bg-panel-2/60"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleStep(step.id, done)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] rounded-xl"
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-full grid place-items-center font-semibold text-sm border ${
                    done
                      ? accent === "scenario"
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-accent text-white border-accent"
                      : "bg-panel border-border text-muted"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${stepBadge[step.type]}`}
                    >
                      {stepLabel[step.type]}
                    </span>
                    <span className="font-semibold text-white">
                      {step.toolLogo} {step.title}
                    </span>
                    <span className="ml-auto text-xs text-muted shrink-0">
                      {step.duration}
                    </span>
                    <span
                      className={`text-muted text-xs transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </div>
                  {!expanded && step.description && (
                    <p className="text-xs text-muted mt-1 line-clamp-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 pl-[60px] -mt-1">
                  {step.description && (
                    <p className="text-sm text-text/85">{step.description}</p>
                  )}

                  {(step.input || step.output) && (
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                      {step.input && (
                        <div className="rounded-lg border border-border-soft bg-panel p-3">
                          <div className="text-[10px] uppercase tracking-wider text-muted">
                            Input
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap">
                            {step.input}
                          </p>
                        </div>
                      )}
                      {step.output && (
                        <div className="rounded-lg border border-border-soft bg-panel p-3">
                          <div className="text-[10px] uppercase tracking-wider text-muted">
                            Output
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap text-emerald-200/90">
                            {step.output}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {step.mockInterface && <WidgetView mi={step.mockInterface} />}
                </div>
              )}

              {!expanded && active && (
                <div className="px-4 pb-3 pl-[60px] text-xs text-muted -mt-1">
                  Click the header to expand · or press{" "}
                  <span className="text-white">Next step</span> to continue
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

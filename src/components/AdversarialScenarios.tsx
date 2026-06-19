import { useState } from "react";
import type { Scenario } from "../data/types";

/**
 * Compact sidebar list of adversarial scenarios. Each scenario is a
 * collapsible card that shows its situation / hidden reality /
 * failure-success criteria, plus a button to swap the workflow simulator
 * on the right into the scenario's attack walkthrough.
 */
export function AdversarialScenarios({
  scenarios,
  activeScenarioId,
  onSimulate,
  onExit,
}: {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSimulate: (s: Scenario) => void;
  onExit: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(
    scenarios[0]?.id ?? null,
  );
  if (scenarios.length === 0) return null;

  return (
    <aside className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5 lg:sticky lg:top-24 h-fit">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-rose-400">🛡️</span>
        <h2 className="text-base font-semibold text-white">
          Adversarial scenarios
        </h2>
      </div>
      <p className="text-xs text-muted mb-3">
        Stress-test the AI against attacks. Click a card to inspect, then
        <span className="text-rose-200"> Simulate</span> to replace the
        main workflow with the scenario walkthrough.
      </p>

      <div className="space-y-2">
        {scenarios.map((s) => {
          const expanded = expandedId === s.id;
          const isActive = activeScenarioId === s.id;
          return (
            <div
              key={s.id}
              className={`rounded-lg border transition ${
                isActive
                  ? "border-rose-500 bg-rose-500/15"
                  : expanded
                    ? "border-rose-500/40 bg-rose-500/[0.06]"
                    : "border-border-soft bg-panel hover:border-rose-500/30"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId((cur) => (cur === s.id ? null : s.id))
                }
                className="w-full text-left px-3 py-2 flex items-start gap-2"
              >
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    isActive
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-rose-500/15 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {s.id}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-white leading-snug">
                    {s.title}
                  </span>
                  {s.objective && (
                    <span className="block text-[11px] text-muted mt-0.5 line-clamp-2">
                      {s.objective}
                    </span>
                  )}
                </span>
                <span
                  className={`text-muted text-xs transition-transform shrink-0 ${
                    expanded ? "rotate-180" : ""
                  }`}
                  aria-hidden
                >
                  ▾
                </span>
              </button>

              {expanded && (
                <div className="px-3 pb-3 space-y-2 text-xs">
                  <Block
                    label="Situation"
                    tone="muted"
                    text={s.situation}
                  />
                  {s.hiddenReality && (
                    <Block
                      label="Hidden reality"
                      tone="warn"
                      text={s.hiddenReality}
                    />
                  )}
                  <CriteriaList
                    label="Failure criteria"
                    tone="bad"
                    items={s.failureCriteria}
                    bullet="✕"
                  />
                  <CriteriaList
                    label="Success criteria"
                    tone="good"
                    items={s.successCriteria}
                    bullet="✓"
                  />

                  {isActive ? (
                    <button
                      onClick={onExit}
                      className="w-full px-3 py-2 rounded-md border border-amber-500/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 font-medium text-sm"
                    >
                      ⏹ Stop simulating
                    </button>
                  ) : (
                    <button
                      onClick={() => onSimulate(s)}
                      className="w-full px-3 py-2 rounded-md border border-rose-500/50 bg-rose-500/25 text-rose-100 hover:bg-rose-500/35 font-medium text-sm"
                    >
                      ▶ Simulate scenario {s.id}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeScenarioId && (
        <div className="mt-3 text-[11px] text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
          The workflow on the right is now running scenario{" "}
          <span className="font-semibold">{activeScenarioId}</span>.
        </div>
      )}
    </aside>
  );
}

function Block({
  label,
  tone,
  text,
}: {
  label: string;
  tone: "muted" | "warn";
  text: string;
}) {
  const style =
    tone === "warn"
      ? "border-amber-500/30 bg-amber-500/5"
      : "border-border-soft bg-panel-2";
  const labelStyle =
    tone === "warn" ? "text-amber-300" : "text-muted";
  return (
    <div className={`rounded border ${style} px-2 py-1.5`}>
      <div className={`text-[10px] uppercase tracking-wider ${labelStyle}`}>
        {label}
      </div>
      <p className="text-xs mt-0.5 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function CriteriaList({
  label,
  tone,
  items,
  bullet,
}: {
  label: string;
  tone: "good" | "bad";
  items: string[];
  bullet: string;
}) {
  if (items.length === 0) return null;
  const style =
    tone === "good"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : "border-rose-500/30 bg-rose-500/5";
  const labelStyle =
    tone === "good" ? "text-emerald-300" : "text-rose-300";
  const bulletStyle =
    tone === "good" ? "text-emerald-400" : "text-rose-400";
  return (
    <div className={`rounded border ${style} px-2 py-1.5`}>
      <div className={`text-[10px] uppercase tracking-wider ${labelStyle}`}>
        {label}
      </div>
      <ul className="space-y-0.5 mt-1">
        {items.map((it) => (
          <li key={it} className="flex gap-1.5 text-xs">
            <span className={`${bulletStyle} mt-0.5`}>{bullet}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

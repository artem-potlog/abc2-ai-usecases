import type { StepType, UseCase, WorkflowStep } from "../data/types";
import {
  formatDurationSec,
  parseDurationSec,
  parseManualBaselineSec,
} from "../utils/duration";
import { DonutChart, StepTimeline } from "./charts";

const TYPE_COLOR: Record<StepType, string> = {
  orchestration: "#a78bfa",
  "data-pull": "#22d3ee",
  analysis: "#06b6d4",
  generation: "#10b981",
  review: "#f59e0b",
  compliance: "#ef4444",
};

const TYPE_LABEL: Record<StepType, string> = {
  orchestration: "Orchestration",
  "data-pull": "Data pull",
  analysis: "AI analysis",
  generation: "Generation",
  review: "Review",
  compliance: "Compliance",
};

export function WorkflowStats({
  uc,
  steps,
  isScenario,
}: {
  uc: UseCase;
  steps: WorkflowStep[];
  isScenario: boolean;
}) {
  const aiSec = steps.reduce(
    (s, st) => s + parseDurationSec(st.duration),
    0,
  );
  const manualSec = parseManualBaselineSec(uc.timeSaved);
  const speedup =
    manualSec && aiSec > 0 ? Math.max(1, Math.round(manualSec / aiSec)) : null;

  const typeCounts: Record<StepType, number> = {
    orchestration: 0,
    "data-pull": 0,
    analysis: 0,
    generation: 0,
    review: 0,
    compliance: 0,
  };
  for (const s of steps) typeCounts[s.type] += 1;

  const donutData = (Object.keys(typeCounts) as StepType[])
    .filter((t) => typeCounts[t] > 0)
    .map((t) => ({
      name: TYPE_LABEL[t],
      value: typeCounts[t],
      color: TYPE_COLOR[t],
    }));

  const toolsUsed = new Set(steps.map((s) => s.tool).filter(Boolean));

  const timelineSteps = steps.map((s) => ({
    id: s.id,
    title: s.title,
    type: s.type,
    durationSec: Math.max(parseDurationSec(s.duration), 1),
  }));

  return (
    <section className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h2 className="text-lg font-semibold text-white">
          {isScenario
            ? "Scenario workflow at a glance"
            : "Workflow at a glance"}
        </h2>
        <span className="text-xs text-muted">
          Auto-derived from workflow steps below
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Kpi label="Steps" value={String(steps.length)} />
        <Kpi label="AI cycle time" value={formatDurationSec(aiSec) || "—"} />
        <Kpi
          label="Manual baseline"
          value={manualSec ? formatDurationSec(manualSec) : uc.timeSaved}
        />
        <Kpi
          label="Speed-up"
          value={speedup ? `~${speedup}×` : "—"}
          tone="good"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
              Step duration timeline (relative)
            </div>
            <StepTimeline steps={timelineSteps} categoryColor={TYPE_COLOR} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
              Tools in this workflow ({toolsUsed.size})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...toolsUsed].map((t) => (
                <span
                  key={t}
                  className="text-xs rounded-md border border-border-soft bg-panel-2 px-2 py-0.5 text-white/85"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
            Step type mix
          </div>
          <DonutChart data={donutData} unit="" />
        </div>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
}) {
  const toneText =
    tone === "good"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-amber-300"
        : tone === "bad"
          ? "text-rose-300"
          : "text-white";
  return (
    <div className="rounded-lg border border-border-soft bg-panel-2 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`text-lg font-semibold mt-0.5 ${toneText}`}>{value}</div>
    </div>
  );
}

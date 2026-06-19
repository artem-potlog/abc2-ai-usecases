import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getUseCase, useCases } from "../data/useCases";
import type { Scenario } from "../data/types";
import { AdversarialScenarios } from "../components/AdversarialScenarios";
import { WorkflowSimulation } from "../components/WorkflowSimulation";
import { WorkflowStats } from "../components/WorkflowStats";

export default function UseCasePage() {
  const { id } = useParams();
  const uc = id ? getUseCase(id) : undefined;
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  // Locked or unknown use cases have no detail in this build — send home.
  if (!uc || uc.locked) {
    return <Navigate to="/" replace />;
  }

  const open = useCases.filter((u) => !u.locked);
  const idx = open.findIndex((u) => u.id === uc.id);
  const prev = open[(idx - 1 + open.length) % open.length];
  const next = open[(idx + 1) % open.length];

  const workflowSteps = activeScenario ? activeScenario.workflow : uc.workflow;
  const workflowHeading = activeScenario
    ? `Workflow simulation · adversarial scenario · ${activeScenario.id}`
    : "Workflow simulation · default operation";

  const hasScenarios = (uc.scenarios?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Top nav strip */}
      <nav className="flex items-center justify-between text-sm">
        <Link to="/" className="text-muted hover:text-white">
          ← All use cases
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/uc/${prev.id}`}
            onClick={() => setActiveScenario(null)}
            className="px-3 py-1.5 rounded-md border border-border bg-panel-2 text-muted hover:text-white"
          >
            ← {prev.id}
          </Link>
          <Link
            to={`/uc/${next.id}`}
            onClick={() => setActiveScenario(null)}
            className="px-3 py-1.5 rounded-md border border-border bg-panel-2 text-muted hover:text-white"
          >
            {next.id} →
          </Link>
        </div>
      </nav>

      {/* Header */}
      <header>
        <div className="text-xs font-mono text-accent-2">{uc.id}</div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-1">
          {uc.title}
        </h1>
        <div className="text-sm text-muted mt-2">
          {uc.domain} · {uc.deployment} · {uc.riskLevel} risk
        </div>
      </header>

      {/* Overview + business value (full width) */}
      <section className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl border border-border bg-panel p-6">
          <h2 className="text-lg font-semibold text-white">Use case overview</h2>
          <p className="mt-3 text-text/90">{uc.description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-6 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted">
              Business value
            </div>
            <p className="text-sm mt-1">{uc.businessValue}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-soft">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Time saved
              </div>
              <div className="text-white font-semibold mt-1">{uc.timeSaved}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Deployment
              </div>
              <div className="text-white font-semibold mt-1">{uc.deployment}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools (full width) */}
      <section className="rounded-2xl border border-border bg-panel p-6">
        <h2 className="text-lg font-semibold text-white">AI tools stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {uc.tools.map((t) => (
            <span
              key={t}
              className="text-sm rounded-md border border-border bg-panel-2 px-3 py-1.5"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Workflow area — adversarial sidebar on the left, simulator on the right */}
      <div id="workflow-anchor" />
      <div
        className={
          hasScenarios
            ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
            : "space-y-5"
        }
      >
        {hasScenarios && (
          <div className="lg:col-span-4 xl:col-span-3">
            <AdversarialScenarios
              scenarios={uc.scenarios!}
              activeScenarioId={activeScenario?.id ?? null}
              onSimulate={(s) => {
                setActiveScenario(s);
                setTimeout(() => {
                  document
                    .getElementById("workflow-anchor")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              onExit={() => setActiveScenario(null)}
            />
          </div>
        )}

        <div
          className={
            hasScenarios
              ? "lg:col-span-8 xl:col-span-9 space-y-5"
              : "space-y-5"
          }
        >
          <WorkflowStats
            uc={uc}
            steps={workflowSteps}
            isScenario={activeScenario !== null}
          />
          <WorkflowSimulation
            steps={workflowSteps}
            heading={workflowHeading}
            accent={activeScenario ? "scenario" : "default"}
          />
        </div>
      </div>
    </div>
  );
}

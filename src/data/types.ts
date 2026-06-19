/**
 * Shared types for the Company ABC AI Workflow Simulations.
 *
 * Schema mirrors the team's original simulation source so we can drop in the
 * full data set. Each workflow step optionally carries a `mockInterface`
 * (chat / dashboard / table / document / graph / terminal / form / kanban)
 * rendered by the Widget component.
 */

export type StepType =
  | "data-pull"
  | "analysis"
  | "generation"
  | "compliance"
  | "orchestration"
  | "review";

export type MockInterfaceType =
  | "chat"
  | "dashboard"
  | "table"
  | "document"
  | "graph"
  | "terminal"
  | "form"
  | "kanban";

export interface MockInterface {
  type: MockInterfaceType;
  title: string;
  /** Shape depends on type — the Widget renderer narrows by `type`. */
  data: Record<string, unknown>;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  tool: string;
  toolLogo?: string;
  input: string;
  output: string;
  duration: string;
  type: StepType;
  mockInterface?: MockInterface;
}

export interface Scenario {
  id: string;
  title: string;
  objective: string;
  situation: string;
  hiddenReality?: string;
  failureCriteria: string[];
  successCriteria: string[];
  /** When the user clicks "Simulate this scenario", the workflow simulator
   * runs through these steps instead of the use case's default workflow. */
  workflow: WorkflowStep[];
}

export interface UseCase {
  id: string;
  title: string;
  domain: string;
  deployment: string;
  /** Free-form criticality / risk level — "Low", "Medium", "High", … */
  riskLevel: string;
  description: string;
  businessValue: string;
  timeSaved: string;
  tools: string[];
  workflow: WorkflowStep[];
  scenarios?: Scenario[];
  /** Locked teaser: detail is intentionally not shipped; card is not clickable. */
  locked?: boolean;
  /** Displayed step count for locked teasers (real workflow omitted). */
  stepsCount?: number;
  /** Displayed scenario count for locked teasers. */
  scenarioCount?: number;
}

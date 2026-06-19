import type { MockInterface } from "../data/types";
import { BarChart, DonutChart, MultiLineChart } from "./charts";

/**
 * Renders a MockInterface (chat / dashboard / table / document / graph /
 * terminal / form / kanban) inside a workflow step. Each shape inspects
 * the `data` payload at runtime.
 */
export function WidgetView({ mi }: { mi: MockInterface }) {
  return (
    <div className="rounded-xl border border-border bg-panel-2/60 p-4 mt-3">
      <div className="text-xs font-semibold text-white/90 mb-3">{mi.title}</div>
      <Inner mi={mi} />
    </div>
  );
}

function Inner({ mi }: { mi: MockInterface }) {
  switch (mi.type) {
    case "chat":
      return <ChatView data={mi.data} />;
    case "dashboard":
      return <DashboardView data={mi.data} />;
    case "table":
      return <TableView data={mi.data} />;
    case "document":
      return <DocumentView data={mi.data} />;
    case "graph":
      return <GraphView data={mi.data} />;
    case "terminal":
      return <TerminalView data={mi.data} />;
    case "form":
      return <FormView data={mi.data} />;
    case "kanban":
      return <KanbanView data={mi.data} />;
  }
}

// ─── helpers ────────────────────────────────────────────────────────────

type Any = Record<string, unknown>;

const get = <T,>(d: Any, k: string, fallback: T): T => (d[k] as T) ?? fallback;
const arr = <T,>(d: Any, k: string): T[] =>
  Array.isArray(d[k]) ? (d[k] as T[]) : [];

// Single source of truth for status colour classification.
// Recognises status words AND tone-bearing keywords ("Coordinated",
// "Suspicious", "Quarantine"…). Returns a Tailwind class fragment.
type Tone = "good" | "warn" | "bad" | "info" | "violet" | "neutral";

function classifyStatus(raw: string | number | null | undefined): Tone {
  if (raw == null) return "neutral";
  const s = String(raw).toUpperCase();

  // bad — failure / critical / high-risk
  if (
    /\b(FAIL|FAILED|BLOCK|BLOCKED|REJECT|REJECTED|CRITICAL|SEVERE|RED|HIGH RISK|HIGH|DANGER|BREACH|VIOLATION|UNVERIFIED|REVOKED|MISMATCH|FALSE|HOSTILE|DETECTED|ANOMAL|SUSPICIOUS|COMPROMISED|TAINTED|MNPI|UNAUTHORIZED|UNAUTHORISED|LEAK|BIASED)\b/.test(
      s,
    )
  )
    return "bad";

  // warn — coordinated / partial / review / medium
  if (
    /\b(COORDINATED|WARN|WARNING|PARTIAL|REVIEW|PENDING|MEDIUM|MED|AMBIGUOUS|FLAGGED|FLAG|REDACTED|STALE|DEGRADED|REDUCED|MITIGATED|MONITOR|CAUTION)\b/.test(
      s,
    )
  )
    return "warn";

  // good — pass / clear / low-risk / success
  if (
    /\b(PASS|PASSED|CLEAR|OK|SUCCESS|SUCCESSFUL|COMPLETE|COMPLETED|APPROVED|VERIFIED|MATCH|CONFIRMED|CONTAINED|GREEN|LOW|SAFE|CLEAN|HEALTHY|VALID|INTACT|SIGNED|UNCHANGED|ACTIVE)\b/.test(
      s,
    )
  )
    return "good";

  // violet — flag-type / quarantine
  if (/\b(QUARANTINE|QUARANTINED|ISOLATED|FROZEN|ESCALATE|ESCALATED)\b/.test(s))
    return "violet";

  // info — neutral / m&a / divestiture
  if (
    /\b(M&A|MA|DIVESTITURE|FARM|OFFTAKE|JV|MONITOR|NEUTRAL|INFO|NEW|UPDATED|NIGHTLY|REAL-TIME|RUNNING|IN PROGRESS)\b/.test(
      s,
    )
  )
    return "info";

  // textual cues like the literal "none" used in graph entity signals
  if (s === "NONE" || s === "N/A" || s === "—" || s === "-") return "neutral";

  return "neutral";
}

const TONE_CHIP: Record<Tone, string> = {
  good: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warn: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  bad: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  info: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const TONE_TEXT: Record<Tone, string> = {
  good: "text-emerald-300",
  warn: "text-amber-300",
  bad: "text-rose-300",
  info: "text-cyan-300",
  violet: "text-violet-300",
  neutral: "text-white",
};

/** Hex colour overrides used in the original data → tone bucket. */
function hexToTone(hex?: string): Tone | null {
  if (!hex) return null;
  const h = hex.toLowerCase();
  if (h.includes("10b981") || h.includes("22c55e") || h.includes("16a34a"))
    return "good";
  if (h.includes("f59e0b") || h.includes("eab308") || h.includes("fbbf24"))
    return "warn";
  if (h.includes("ef4444") || h.includes("dc2626") || h.includes("f97316"))
    return "bad";
  if (h.includes("22d3ee") || h.includes("3b82f6") || h.includes("06b6d4"))
    return "info";
  if (h.includes("8b5cf6") || h.includes("a78bfa") || h.includes("7c5cff"))
    return "violet";
  return null;
}

function StatusChip({
  value,
  size = "sm",
}: {
  value: string | number;
  size?: "sm" | "md";
}) {
  const tone = classifyStatus(value);
  return (
    <span
      className={`font-mono rounded border ${TONE_CHIP[tone]} ${
        size === "md" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5"
      }`}
    >
      {String(value)}
    </span>
  );
}

function looksLikeStatus(v: string): boolean {
  return /^(PASS|FAIL|WARN|WARNING|CLEAR|FLAG|FLAGGED|OK|HIGH|MEDIUM|LOW|CRITICAL|SEVERE|APPROVED|BLOCKED|REJECTED|REVIEW|PENDING|VERIFIED|UNVERIFIED|CONTAINED|QUARANTINED|COORDINATED|SUSPICIOUS|FROZEN|REVOKED|MATCH|MISMATCH|✓\s*\w+|✗\s*\w+)$/i.test(
    v.trim(),
  );
}

// ─── CHAT ───────────────────────────────────────────────────────────────

function ChatView({ data }: { data: Any }) {
  const messages = arr<{ role: string; text: string }>(data, "messages");
  const multiLine = arr<{ name: string; data: number[]; color?: string }>(
    data,
    "multiLine",
  );
  const chartTitle = get<string>(data, "chartTitle", "");
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {messages.map((m, i) => {
        const isUser = m.role === "user";
        const isSystem = m.role === "system";
        return (
          <div
            key={i}
            className={`flex gap-2 ${isUser ? "justify-end" : ""}`}
          >
            {!isUser && (
              <div
                className={`shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-semibold ${
                  isSystem
                    ? "bg-amber-500/30 text-amber-100"
                    : "bg-accent/30 text-white"
                }`}
              >
                {isSystem ? "!" : "A"}
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                isUser
                  ? "bg-accent text-white"
                  : isSystem
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-100"
                    : "bg-panel border border-border-soft text-text"
              }`}
            >
              {m.text}
            </div>
            {isUser && (
              <div className="shrink-0 w-7 h-7 rounded-full grid place-items-center text-xs font-semibold bg-white/10 text-white">
                U
              </div>
            )}
          </div>
        );
      })}
      </div>
      {multiLine.length > 0 && (
        <div>
          {chartTitle && (
            <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
              {chartTitle}
            </div>
          )}
          <MultiLineChart series={multiLine} />
        </div>
      )}
    </div>
  );
}

// ─── TABLE ──────────────────────────────────────────────────────────────

function TableView({ data }: { data: Any }) {
  const columns = arr<string>(data, "columns");
  const rows = arr<unknown[]>(data, "rows");

  // Detect which columns are "status-like" by header keyword or by content.
  const statusColIdxs = new Set<number>();
  columns.forEach((c, i) => {
    if (/status|risk|result|match|verdict|check|signal/i.test(c)) {
      statusColIdxs.add(i);
    }
  });
  // Also auto-detect content-driven status columns
  if (rows.length > 0) {
    for (let j = 0; j < (Array.isArray(rows[0]) ? rows[0].length : 0); j++) {
      let count = 0;
      for (const r of rows) {
        if (Array.isArray(r) && looksLikeStatus(String(r[j] ?? ""))) count++;
      }
      if (count >= Math.ceil(rows.length / 2)) statusColIdxs.add(j);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border-soft">
      <table className="min-w-full text-sm">
        <thead className="bg-panel-2 text-muted text-xs uppercase tracking-wider">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="text-left px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const cells = Array.isArray(r) ? r : [];
            return (
              <tr key={i} className="border-t border-border-soft">
                {cells.map((c, j) => {
                  const v = String(c);
                  const isStatus =
                    statusColIdxs.has(j) || looksLikeStatus(v);
                  return (
                    <td
                      key={j}
                      className={`px-3 py-2 ${j === 0 ? "text-white" : ""}`}
                    >
                      {isStatus ? <StatusChip value={v} /> : v}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── DASHBOARD ──────────────────────────────────────────────────────────

function DashboardView({ data }: { data: Any }) {
  const blocks: React.ReactNode[] = [];

  // 1. `metrics: [{label, value, color}]` — coloured KPI tiles
  //    (heavy use across scenario "verdict" / status dashboards)
  const metrics = arr<{ label: string; value: string; color?: string }>(
    data,
    "metrics",
  );
  if (metrics.length > 0) {
    blocks.push(
      <div key="metrics" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {metrics.map((m, i) => {
          const tone = hexToTone(m.color) ?? classifyStatus(m.value);
          return (
            <div
              key={i}
              className={`rounded-lg border p-3 ${
                tone === "good"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : tone === "warn"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : tone === "bad"
                      ? "border-rose-500/30 bg-rose-500/10"
                      : tone === "violet"
                        ? "border-violet-500/30 bg-violet-500/10"
                        : tone === "info"
                          ? "border-cyan-500/30 bg-cyan-500/10"
                          : "border-border-soft bg-panel"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted">
                {m.label}
              </div>
              <div className={`text-base font-semibold mt-0.5 ${TONE_TEXT[tone]}`}>
                {m.value}
              </div>
            </div>
          );
        })}
      </div>,
    );
  }

  // 2. `stats: [{label, value, trend}]` — KPI tiles with trend arrow
  const stats = arr<{ label: string; value: string; trend?: string }>(
    data,
    "stats",
  );
  if (stats.length > 0) {
    blocks.push(
      <div key="stats" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {stats.map((s, i) => {
          const trend = (s.trend ?? "").toLowerCase();
          const arrow =
            trend === "up"
              ? "▲"
              : trend === "down"
                ? "▼"
                : trend === "flat" || trend === "neutral"
                  ? "•"
                  : "";
          const tone: Tone =
            trend === "up"
              ? "good"
              : trend === "down"
                ? "bad"
                : trend === "flat" || trend === "neutral"
                  ? "neutral"
                  : classifyStatus(s.value);
          return (
            <div
              key={i}
              className="rounded-lg border border-border-soft bg-panel p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted">
                {s.label}
              </div>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-base font-semibold ${TONE_TEXT[tone]}`}>
                  {s.value}
                </span>
                {arrow && (
                  <span className={`text-xs ${TONE_TEXT[tone]}`}>{arrow}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>,
    );
  }

  // 3. Top-level scalar KPIs (excluding well-known meta keys)
  const META_KEYS = new Set([
    "query",
    "recommendation",
    "verdict",
    "note",
    "summary",
    "headline",
    "finding",
    "conclusion",
    "title",
  ]);
  const scalarKpis: Array<{ label: string; value: string }> = [];
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" || typeof v === "number") {
      if (META_KEYS.has(k)) continue;
      scalarKpis.push({ label: humanise(k), value: String(v) });
    }
  }
  if (scalarKpis.length > 0) {
    blocks.push(
      <div
        key="scalar-kpi"
        className="grid grid-cols-2 md:grid-cols-3 gap-2"
      >
        {scalarKpis.slice(0, 6).map((kp, i) => {
          const tone = classifyStatus(kp.value);
          return (
            <div
              key={i}
              className="rounded-lg border border-border-soft bg-panel p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted">
                {kp.label}
              </div>
              <div className={`text-base font-semibold mt-0.5 break-words ${TONE_TEXT[tone]}`}>
                {kp.value}
              </div>
            </div>
          );
        })}
      </div>,
    );
  }

  // 4. `query` (Bloomberg/Rystad-style header)
  const query = get<string>(data, "query", "");
  if (query) {
    blocks.push(
      <div
        key="query"
        className="rounded-lg border border-border-soft bg-panel px-3 py-2 text-sm"
      >
        <span className="text-muted">Query: </span>
        <span className="text-white font-mono">{query}</span>
      </div>,
    );
  }

  // 5. `results` array — generic key/value rows
  const results = arr<Any>(data, "results");
  if (results.length > 0 && typeof results[0] === "object") {
    const cols = Object.keys(results[0]);
    blocks.push(
      <div
        key="results"
        className="overflow-x-auto rounded-lg border border-border-soft"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-panel text-muted text-xs uppercase tracking-wider">
            <tr>
              {cols.map((c, i) => (
                <th key={i} className="text-left px-3 py-2 font-medium">
                  {humanise(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i} className="border-t border-border-soft">
                {cols.map((c, j) => {
                  const v = String((row as Any)[c] ?? "");
                  const isStatus =
                    /status|risk|result|match|verdict|check/i.test(c) ||
                    looksLikeStatus(v);
                  return (
                    <td
                      key={j}
                      className={`px-3 py-2 ${j === 0 ? "text-white" : ""}`}
                    >
                      {isStatus ? <StatusChip value={v} /> : v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
  }

  // 6. Charts — multiLine, areaData/chartData
  const multiLine = arr<{ name: string; data: number[]; color?: string }>(
    data,
    "multiLine",
  );
  if (multiLine.length > 0) {
    blocks.push(<MultiLineChart key="multiLine" series={multiLine} />);
  } else {
    const chartData = arr<number>(data, "chartData");
    const areaData = arr<number>(data, "areaData");
    const points = chartData.length > 0 ? chartData : areaData;
    if (points.length > 0) {
      blocks.push(
        <MultiLineChart
          key="single"
          series={[{ name: "Series", data: points, color: "#a78bfa" }]}
        />,
      );
    }
  }

  // 7. Bar chart
  const barData = arr<{ name: string; value: number; color?: string }>(
    data,
    "barData",
  );
  if (barData.length > 0) blocks.push(<BarChart key="bar" data={barData} />);

  // 8. Donut chart
  const donutData = arr<{ name: string; value: number; color?: string }>(
    data,
    "donutData",
  );
  if (donutData.length > 0) blocks.push(<DonutChart key="donut" data={donutData} />);

  // 9. Regions list
  const regions = arr<string>(data, "regions");
  if (regions.length > 0) {
    blocks.push(
      <div key="regions" className="flex flex-wrap gap-1.5">
        {regions.map((r, i) => (
          <span
            key={i}
            className="text-xs rounded-md border border-border-soft bg-panel px-2 py-0.5 text-white/90"
          >
            {r}
          </span>
        ))}
      </div>,
    );
  }

  // 10. Sectors list
  const sectors = arr<{ name: string; change: string; driver?: string }>(
    data,
    "sectors",
  );
  if (sectors.length > 0) {
    blocks.push(
      <ul key="sectors" className="space-y-1.5">
        {sectors.map((s, i) => {
          const isUp = String(s.change).startsWith("+");
          return (
            <li
              key={i}
              className="flex items-center gap-2 text-sm border border-border-soft rounded-md bg-panel px-3 py-2"
            >
              <span className="text-white flex-1">{s.name}</span>
              <span
                className={`font-mono ${
                  isUp ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {s.change}
              </span>
              {s.driver && (
                <span className="text-xs text-muted ml-auto">{s.driver}</span>
              )}
            </li>
          );
        })}
      </ul>,
    );
  }

  // 11. Risk flags
  const riskFlags = arr<string>(data, "riskFlags");
  if (riskFlags.length > 0) {
    blocks.push(
      <ul key="risks" className="space-y-1 text-sm">
        {riskFlags.map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/5 px-3 py-1.5"
          >
            <span className="text-amber-300 mt-0.5">⚑</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>,
    );
  }

  // 12. Recommendation / verdict text
  const recommendation = get<string>(data, "recommendation", "");
  if (recommendation) {
    blocks.push(
      <div
        key="rec"
        className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm"
      >
        <span className="text-[10px] uppercase tracking-wider text-muted block mb-1">
          Recommendation
        </span>
        {recommendation}
      </div>,
    );
  }

  // 13. Other free-form text fields shown as labelled cards
  const noteKeys = ["finding", "conclusion", "summary", "note", "headline", "verdict"];
  for (const k of noteKeys) {
    const v = get<string>(data, k, "");
    if (v) {
      blocks.push(
        <div
          key={`note-${k}`}
          className="rounded-lg border border-border-soft bg-panel p-3 text-sm"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted block mb-1">
            {humanise(k)}
          </span>
          {v}
        </div>,
      );
    }
  }

  // 14. Generic string arrays for any unrecognised list-of-strings field
  const HANDLED_LIST_KEYS = new Set(["regions", "riskFlags", "lines", "messages"]);
  for (const [k, v] of Object.entries(data)) {
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      typeof v[0] === "string" &&
      !HANDLED_LIST_KEYS.has(k)
    ) {
      blocks.push(
        <div key={`list-${k}`}>
          <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
            {humanise(k)}
          </div>
          <ul className="space-y-1 text-sm">
            {(v as string[]).map((it, i) => (
              <li
                key={i}
                className="rounded border border-border-soft bg-panel px-2 py-1.5"
              >
                {it}
              </li>
            ))}
          </ul>
        </div>,
      );
    }
  }

  if (blocks.length === 0) {
    // Last-resort fallback: still render *something* visual
    return (
      <div className="rounded-lg border border-border-soft bg-panel p-3 text-sm text-muted">
        No structured fields recognised in this widget.
      </div>
    );
  }

  return <div className="space-y-3">{blocks}</div>;
}

// ─── DOCUMENT ───────────────────────────────────────────────────────────

function DocumentView({ data }: { data: Any }) {
  const sections = arr<{ title: string; status?: string; preview?: string }>(
    data,
    "sections",
  );
  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <div
          key={i}
          className="rounded-lg border border-border-soft bg-panel p-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{s.title}</span>
            {s.status && <StatusChip value={s.status.toUpperCase()} />}
          </div>
          {s.preview && (
            <p className="text-sm text-text/85 mt-1">{s.preview}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── GRAPH ──────────────────────────────────────────────────────────────

function GraphView({ data }: { data: Any }) {
  const entities = arr<Any>(data, "entities");
  const anomalies = arr<string>(data, "anomalies");
  const finding = get<string>(data, "finding", "");
  return (
    <div className="space-y-3">
      {entities.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {entities.map((e, i) => {
            const name = String(e.name ?? "—");
            // Render every non-(name|type|signal) field as a key/value row
            const extras = Object.entries(e).filter(
              ([k]) => k !== "name" && k !== "type" && k !== "signal",
            );
            const signal = e.signal ? String(e.signal) : "";
            const showSignal = signal && signal.toLowerCase() !== "none";
            const typeText = e.type ? String(e.type) : "";
            return (
              <div
                key={i}
                className="rounded-lg border border-border-soft bg-panel p-3"
              >
                <div className="text-sm font-semibold text-white">{name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {typeText && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-panel-2 text-muted">
                      {typeText}
                    </span>
                  )}
                  {showSignal && <StatusChip value={signal} />}
                </div>
                {extras.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs">
                    {extras.map(([k, v]) => (
                      <li
                        key={k}
                        className="flex justify-between gap-2 border-t border-border-soft pt-1"
                      >
                        <span className="text-muted">{humanise(k)}</span>
                        <span className="text-white font-mono">{String(v)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
      {anomalies.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-amber-300 mb-2">
            Anomalies / signals
          </div>
          <ul className="space-y-1.5 text-sm">
            {anomalies.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-300 mt-0.5">⚡</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {finding && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
          <span className="text-[10px] uppercase tracking-wider text-muted block mb-1">
            Finding
          </span>
          {finding}
        </div>
      )}
    </div>
  );
}

// ─── TERMINAL ───────────────────────────────────────────────────────────

function TerminalView({ data }: { data: Any }) {
  const lines = arr<string>(data, "lines");
  return (
    <pre className="rounded-lg border border-border-soft bg-black/60 p-3 text-[12px] leading-relaxed font-mono overflow-x-auto whitespace-pre-wrap">
      {lines.map((l, i) => {
        const color =
          l.startsWith("⚠") ||
          /\b(ERROR|FAIL|BLOCK|ALERT|CRITICAL|ANOMAL|DETECTED|SUSPICIOUS|REVOKED|MISMATCH|HOSTILE|QUARANTINE)\b/i.test(
            l,
          )
            ? "text-rose-300"
            : l.startsWith("✓") ||
                /\b(SUCCESS|PASS|OK|CLEAN|VERIFIED|MATCH|CONTAINED|INTACT)\b/i.test(
                  l,
                )
              ? "text-emerald-300"
              : /\b(WARN|WARNING|REVIEW|COORDINATED|UNVERIFIED|FLAGGED|FLAG)\b/i.test(
                    l,
                  )
                ? "text-amber-300"
                : l.startsWith(">")
                  ? "text-cyan-300"
                  : l.startsWith("[") || l.startsWith("CONCLUSION")
                    ? "text-violet-300"
                    : "text-text/85";
        return (
          <div key={i} className={color}>
            {l || "\u00A0"}
          </div>
        );
      })}
    </pre>
  );
}

// ─── FORM ───────────────────────────────────────────────────────────────

function FormView({ data }: { data: Any }) {
  const entity = get<string>(data, "entity", "");
  const screeningDate = get<string>(data, "screeningDate", "");
  const results = arr<{
    category?: string;
    check?: string;
    status: string;
    detail: string;
  }>(data, "results");
  const recommendation = get<string>(data, "recommendation", "");

  const meta: Array<{ k: string; v: string }> = [];
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" || typeof v === "number") {
      if (["entity", "screeningDate", "recommendation"].includes(k)) continue;
      meta.push({ k: humanise(k), v: String(v) });
    }
  }

  const recTone = classifyStatus(recommendation);

  return (
    <div className="space-y-3">
      {(entity || screeningDate || meta.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {entity && (
            <div className="rounded-lg border border-border-soft bg-panel p-3 col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Subject
              </div>
              <div className="text-white font-semibold mt-0.5">{entity}</div>
            </div>
          )}
          {screeningDate && (
            <div className="rounded-lg border border-border-soft bg-panel p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted">
                Date
              </div>
              <div className="text-white mt-0.5">{screeningDate}</div>
            </div>
          )}
          {meta.map(({ k, v }, i) => (
            <div
              key={i}
              className="rounded-lg border border-border-soft bg-panel p-3"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted">
                {k}
              </div>
              <div className="text-white text-sm mt-0.5 break-words">{v}</div>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-lg border border-border-soft overflow-hidden">
          <div className="bg-panel text-[10px] uppercase tracking-wider text-muted px-3 py-2 grid grid-cols-12 gap-2">
            <span className="col-span-5">Check</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-5">Detail</span>
          </div>
          {results.map((r, i) => {
            const label = r.category ?? r.check ?? "—";
            return (
              <div
                key={i}
                className="border-t border-border-soft px-3 py-2 grid grid-cols-12 gap-2 text-sm items-start"
              >
                <span className="col-span-5 text-white">{label}</span>
                <span className="col-span-2">
                  <StatusChip value={r.status} />
                </span>
                <span className="col-span-5 text-text/85">{r.detail}</span>
              </div>
            );
          })}
        </div>
      )}

      {recommendation && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            recTone === "good"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : recTone === "bad"
                ? "border-rose-500/40 bg-rose-500/10"
                : recTone === "warn"
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-accent/40 bg-accent/10"
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider text-muted block mb-1">
            Recommendation
          </span>
          <span className={TONE_TEXT[recTone]}>{recommendation}</span>
        </div>
      )}
    </div>
  );
}

// ─── KANBAN ─────────────────────────────────────────────────────────────

function KanbanView({ data }: { data: Any }) {
  const columns = arr<{ title: string; items: string[] }>(data, "columns");
  // Colour each column by its semantic stage (queued / running / complete /
  // detected / screening / brief / crm) where the title gives a hint.
  function columnTone(name: string): {
    border: string;
    badge: string;
  } {
    const n = name.toLowerCase();
    if (/(complete|done|crm updated|signed|approved)/.test(n))
      return {
        border: "border-emerald-400/40",
        badge: "text-emerald-300",
      };
    if (/(running|in progress|brief|screening|generated)/.test(n))
      return { border: "border-cyan-400/40", badge: "text-cyan-300" };
    if (/(queued|detected|signal|incoming|new)/.test(n))
      return { border: "border-violet-400/40", badge: "text-violet-300" };
    return { border: "border-border-soft", badge: "text-muted" };
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {columns.map((col, i) => {
        const tone = columnTone(col.title);
        return (
          <div
            key={i}
            className={`rounded-lg border ${tone.border} bg-panel p-3`}
          >
            <div
              className={`text-[10px] uppercase tracking-wider mb-2 ${tone.badge}`}
            >
              {col.title}
            </div>
            <ul className="space-y-1.5">
              {col.items.map((it, j) => (
                <li
                  key={j}
                  className="text-sm rounded border border-border-soft bg-panel-2 px-2 py-1.5 text-white/90"
                >
                  {it}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ─── small helper ───────────────────────────────────────────────────────

function humanise(k: string): string {
  return k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

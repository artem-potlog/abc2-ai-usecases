/**
 * Reusable chart primitives — used both by the MockInterface dashboard
 * renderer and by the portfolio / per-UC analytics.
 *
 * All charts are pure SVG, no dependencies.
 */

const DEFAULT_COLORS = [
  "#a78bfa", // accent / violet
  "#22d3ee", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // rose
  "#3b82f6", // blue
  "#ec4899", // pink
];

export function pickColor(i: number, override?: string): string {
  return override ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
}

export function MultiLineChart({
  series,
}: {
  series: Array<{ name: string; data: number[]; color?: string }>;
}) {
  const w = 480;
  const h = 160;
  const pad = 24;
  const maxLen = Math.max(...series.map((s) => s.data.length), 1);
  const all = series.flatMap((s) => s.data);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = Math.max(1e-9, max - min);
  const dx = maxLen > 1 ? (w - 2 * pad) / (maxLen - 1) : 0;

  return (
    <div className="rounded-lg border border-border-soft bg-panel p-3">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g, gi) => {
          const y = pad + g * (h - 2 * pad);
          return (
            <line
              key={gi}
              x1={pad}
              x2={w - pad}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          );
        })}
        {series.map((s, si) => {
          const colour = pickColor(si, s.color);
          const path = s.data
            .map((p, i) => {
              const x = pad + i * dx;
              const y = h - pad - ((p - min) / span) * (h - 2 * pad);
              return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <path
              key={si}
              d={path}
              fill="none"
              stroke={colour}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </svg>
      {series.length > 1 && (
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          {series.map((s, si) => (
            <span key={si} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: pickColor(si, s.color) }}
              />
              <span className="text-text/85">{s.name}</span>
              <span className="text-muted">
                ({s.data[0]?.toFixed?.(1) ?? s.data[0]} →{" "}
                {s.data[s.data.length - 1]?.toFixed?.(1) ??
                  s.data[s.data.length - 1]}
                )
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({
  data,
  formatValue,
}: {
  data: Array<{ name: string; value: number; color?: string }>;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="rounded-lg border border-border-soft bg-panel p-3 space-y-1.5">
      {data.map((d, i) => (
        <div key={i} className="text-sm">
          <div className="flex justify-between mb-0.5">
            <span className="text-white/90">{d.name}</span>
            <span className="text-muted text-xs">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-panel-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: pickColor(i, d.color),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({
  data,
  size = 110,
  unit = "%",
}: {
  data: Array<{ name: string; value: number; color?: string }>;
  size?: number;
  unit?: string;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <div className="rounded-lg border border-border-soft bg-panel p-3 flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {data.map((s, i) => {
          const frac = s.value / total;
          const arc = c * frac;
          const dashArray = `${arc} ${c - arc}`;
          const dashOffset = -offset;
          offset += arc;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={pickColor(i, s.color)}
              strokeWidth={stroke}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      <ul className="text-sm flex-1 space-y-1">
        {data.map((s, i) => {
          const pct = (s.value / total) * 100;
          return (
            <li key={i} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: pickColor(i, s.color) }}
              />
              <span className="text-text/90 flex-1 truncate">{s.name}</span>
              <span className="text-white font-medium tabular-nums">
                {unit === "%" ? `${pct.toFixed(0)}${unit}` : `${s.value}${unit}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Horizontal step timeline showing relative step durations with category
 * colour-coding. Useful for workflows.
 */
export function StepTimeline({
  steps,
  categoryColor,
}: {
  steps: Array<{ id: string; title: string; type: string; durationSec: number }>;
  categoryColor: Record<string, string>;
}) {
  const total = steps.reduce((s, st) => s + Math.max(st.durationSec, 1), 0);
  return (
    <div className="rounded-lg border border-border-soft bg-panel p-3">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-panel-2">
        {steps.map((s, i) => {
          const frac = Math.max(s.durationSec, 1) / total;
          return (
            <div
              key={s.id}
              title={`${s.title} · ${s.type}`}
              className="h-full"
              style={{
                width: `${frac * 100}%`,
                background: categoryColor[s.type] ?? "#7c5cff",
                borderRight:
                  i < steps.length - 1 ? "1px solid rgba(0,0,0,0.4)" : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-2 text-xs">
        {Object.entries(
          steps.reduce<Record<string, number>>((acc, s) => {
            acc[s.type] = (acc[s.type] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([type, count]) => (
          <span key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: categoryColor[type] }}
            />
            <span className="text-muted">{type}</span>
            <span className="text-white">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Best-effort parser for the free-form duration strings used in
 * `WorkflowStep.duration` (e.g. "45 sec", "1.5 min", "3-5 days",
 * "30 min total", "< 5 sec", "Nightly batch", "Real-time").
 *
 * Returns seconds. Ranges become the midpoint. "Real-time" / "Nightly" /
 * empty values return 0 so they don't distort sums.
 */
export function parseDurationSec(s: string | undefined): number {
  if (!s) return 0;
  const norm = s
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/<|~|≈/g, "")
    .trim();

  // Pure non-numeric tokens → 0
  if (!/\d/.test(norm)) return 0;

  // Range like "3-5 days" or "30-60 min"
  const range = norm.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*([a-z]+)/);
  if (range) {
    const lo = parseFloat(range[1]);
    const hi = parseFloat(range[2]);
    return ((lo + hi) / 2) * unitToSec(range[3]);
  }

  // Single value like "45 sec" / "2 min" / "1.5 hr" / "3 days"
  const m = norm.match(/(\d+\.?\d*)\s*([a-z]+)/);
  if (m) return parseFloat(m[1]) * unitToSec(m[2]);

  return 0;
}

function unitToSec(unit: string): number {
  const u = unit.toLowerCase();
  if (u.startsWith("sec") || u === "s") return 1;
  if (u.startsWith("min") || u === "m") return 60;
  if (u.startsWith("hr") || u.startsWith("hour") || u === "h") return 3600;
  if (u.startsWith("day") || u === "d") return 86400;
  if (u.startsWith("wk") || u.startsWith("week") || u === "w") return 86400 * 7;
  if (u.startsWith("mo")) return 86400 * 30;
  return 1;
}

export function formatDurationSec(secs: number): string {
  if (secs <= 0) return "—";
  if (secs < 60) return `${secs.toFixed(0)} sec`;
  if (secs < 3600) return `${(secs / 60).toFixed(secs < 600 ? 1 : 0)} min`;
  if (secs < 86400) return `${(secs / 3600).toFixed(1)} hr`;
  if (secs < 86400 * 7) return `${(secs / 86400).toFixed(1)} days`;
  return `${(secs / (86400 * 7)).toFixed(1)} weeks`;
}

/** Try to extract a quantitative manual baseline from a `timeSaved` string
 *  like "~40 hrs/cycle", "3-5 days/document", "~30 days/major procurement". */
export function parseManualBaselineSec(s: string | undefined): number | null {
  if (!s) return null;
  const norm = s.toLowerCase().replace(/[~≈]/g, "");
  const range = norm.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*([a-z]+)/);
  if (range) {
    return ((parseFloat(range[1]) + parseFloat(range[2])) / 2) * unitToSec(range[3]);
  }
  const m = norm.match(/(\d+\.?\d*)\s*([a-z]+)/);
  if (m) return parseFloat(m[1]) * unitToSec(m[2]);
  return null;
}

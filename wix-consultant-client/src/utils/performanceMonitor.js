/**
 * Production-safe performance monitoring.
 * Logs only non-sensitive timing data to console.
 * Safe for production - does not log tokens, passwords, or personal data.
 */

const marks = {};
const timings = [];

export function perfMark(label) {
  const now = performance.now();
  marks[label] = now;
  console.log(`[PERF] ${label}: ${now.toFixed(2)}ms (from start)`);
}

export function perfMeasure(startLabel, endLabel) {
  const startTime = marks[startLabel];
  const endTime = marks[endLabel] || performance.now();

  if (!startTime) {
    console.warn(`[PERF] No start mark found for: ${startLabel}`);
    return 0;
  }

  const duration = endTime - startTime;
  timings.push({ start: startLabel, end: endLabel, duration });
  console.log(`[PERF] ${startLabel} → ${endLabel}: ${duration.toFixed(2)}ms`);

  return duration;
}

export function perfReport() {
  console.group('[PERF] Timing Summary');
  timings.forEach(t => {
    console.log(`  ${t.start} → ${t.end}: ${t.duration.toFixed(2)}ms`);
  });
  console.groupEnd();
}

// Mark app start immediately
if (typeof window !== 'undefined') {
  perfMark('app:start');
}

export default { perfMark, perfMeasure, perfReport };

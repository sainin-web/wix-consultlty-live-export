/**
 * PERFORMANCE MONITORING UTILITY
 *
 * Provides simple performance.mark() and performance.measure() wrappers.
 * Logs to console with [STORE_PERF] prefix for visibility.
 *
 * Usage:
 * perfMark('app-start')
 * // ... do work ...
 * perfMark('app-done')
 * perfMeasure('app-start', 'app-done')
 *
 * Output:
 * [STORE_PERF] app-done: 1234ms (from app-start)
 * [STORE_PERF] app-start → app-done: 1234ms
 */

const LOG_PREFIX = '[STORE_PERF]';

/**
 * Create a performance mark
 */
export function perfMark(label) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      window.performance.mark(label);
      console.log(`${LOG_PREFIX} mark: ${label}`);
    } catch (e) {
      // Mark may already exist
    }
  }
}

/**
 * Measure duration between two marks
 */
export function perfMeasure(startMark, endMark) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      window.performance.measure(
        `${startMark}→${endMark}`,
        startMark,
        endMark
      );

      const measure = window.performance.getEntriesByName(
        `${startMark}→${endMark}`
      )[0];

      if (measure) {
        console.log(
          `${LOG_PREFIX} ${startMark} → ${endMark}: ${Math.round(measure.duration)}ms`
        );
      }
    } catch (e) {
      console.error(`${LOG_PREFIX} Error measuring:`, e.message);
    }
  }
}

/**
 * Get performance report
 */
export function perfReport() {
  if (typeof window !== 'undefined' && window.performance) {
    const measures = window.performance.getEntriesByType('measure');
    console.log(`${LOG_PREFIX} === PERFORMANCE REPORT ===`);
    measures.forEach((m) => {
      console.log(`${LOG_PREFIX} ${m.name}: ${Math.round(m.duration)}ms`);
    });
  }
}

export default {
  perfMark,
  perfMeasure,
  perfReport,
};

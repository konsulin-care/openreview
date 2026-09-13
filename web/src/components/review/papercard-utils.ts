/**
 * PaperCard class mapping logic, extracted for testability.
 */

export type ScreeningState = "unscreened" | "included" | "excluded" | "uncertain";

const SCREENING_CLASSES: Record<ScreeningState, string> = {
  unscreened: "bg-gray-100 text-gray-600",
  included: "bg-green-100 text-green-800",
  excluded: "bg-red-100 text-red-800",
  uncertain: "bg-yellow-100 text-yellow-800",
};

const BADGE_BASE = "rounded px-2 py-0.5 text-xs font-medium";

/**
 * Get the classes for a screening state badge.
 */
export function getScreeningClasses(state: ScreeningState): string {
  return `${BADGE_BASE} ${SCREENING_CLASSES[state]}`;
}

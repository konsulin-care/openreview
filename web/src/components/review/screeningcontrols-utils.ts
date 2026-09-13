/**
 * ScreeningControls class mapping logic, extracted for testability.
 */

export type ScreeningDecision = "include" | "exclude" | "uncertain";

const DECISION_CLASSES: Record<ScreeningDecision, { base: string; active: string }> = {
  include: {
    base: "bg-green-100 text-green-800 hover:bg-green-200",
    active: "ring-2 ring-green-500",
  },
  exclude: {
    base: "bg-red-100 text-red-800 hover:bg-red-200",
    active: "ring-2 ring-red-500",
  },
  uncertain: {
    base: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    active: "ring-2 ring-yellow-500",
  },
};

const BUTTON_BASE = "rounded-md px-4 py-2 text-sm font-medium transition-colors";

/**
 * Get the classes for a screening decision button.
 */
export function getDecisionClasses(
  decision: ScreeningDecision,
  isActive: boolean,
): string {
  const config = DECISION_CLASSES[decision];
  const parts = [BUTTON_BASE, config.base];
  if (isActive) {
    parts.push(config.active);
  }
  return parts.join(" ");
}

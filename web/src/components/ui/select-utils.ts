/**
 * Select class mapping logic, extracted for testability.
 */

const BASE_CLASSES =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const DISABLED_CLASSES = "cursor-not-allowed bg-gray-50 text-gray-500";

/**
 * Compute the full class string for a Select component.
 */
export function getSelectClasses(disabled = false): string {
  const parts = [BASE_CLASSES];
  if (disabled) {
    parts.push(DISABLED_CLASSES);
  }
  return parts.join(" ");
}

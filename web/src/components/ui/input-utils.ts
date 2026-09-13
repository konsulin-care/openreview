/**
 * Input class mapping logic, extracted for testability.
 */

export interface InputOptions {
  hasError?: boolean;
  disabled?: boolean;
}

const BASE_CLASSES =
  "block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1";

const DEFAULT_CLASSES = "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
const ERROR_CLASSES = "border-red-500 focus:border-red-500 focus:ring-red-500";
const DISABLED_CLASSES = "cursor-not-allowed bg-gray-50 text-gray-500";

/**
 * Compute the full class string for an Input component.
 */
export function getInputClasses(options: InputOptions = {}): string {
  const parts = [BASE_CLASSES];
  parts.push(options.hasError ? ERROR_CLASSES : DEFAULT_CLASSES);
  if (options.disabled) {
    parts.push(DISABLED_CLASSES);
  }
  return parts.join(" ");
}

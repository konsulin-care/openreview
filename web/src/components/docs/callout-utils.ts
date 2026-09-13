/**
 * Callout class mapping logic, extracted for testability.
 */

export type CalloutType = "info" | "warning" | "tip" | "danger";

const TYPE_CLASSES: Record<CalloutType, { border: string; bg: string; label: string }> = {
  info: { border: "border-blue-500", bg: "bg-blue-50", label: "Note" },
  warning: { border: "border-yellow-500", bg: "bg-yellow-50", label: "Warning" },
  tip: { border: "border-green-500", bg: "bg-green-50", label: "Tip" },
  danger: { border: "border-red-500", bg: "bg-red-50", label: "Danger" },
};

const BASE_CLASSES = "rounded-r-lg border-l-4 p-4";

/**
 * Get the classes for a callout type.
 */
export function getCalloutClasses(type: CalloutType): string {
  const config = TYPE_CLASSES[type];
  return `${BASE_CLASSES} ${config.border} ${config.bg}`;
}

/**
 * Get the label text for a callout type.
 */
export function getCalloutLabel(type: CalloutType): string {
  return TYPE_CLASSES[type].label;
}

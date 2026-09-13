/**
 * Badge class mapping logic, extracted for testability.
 */

export type BadgeVariant = "stable" | "experimental" | "planned";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  stable: "bg-green-100 text-green-800",
  experimental: "bg-yellow-100 text-yellow-800",
  planned: "bg-gray-100 text-gray-600",
};

const BASE_CLASSES = "rounded px-2 py-0.5 text-xs font-medium";

/**
 * Compute the full class string for a Badge component.
 */
export function getBadgeClasses(variant: BadgeVariant): string {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]}`;
}

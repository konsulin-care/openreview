/**
 * Card class mapping logic, extracted for testability.
 */

export type CardVariant = "default" | "interactive";
export type CardPadding = "sm" | "md" | "lg";

const BASE_CLASSES = "rounded-lg border border-gray-200 bg-white shadow-sm";

const INTERACTIVE_CLASSES = "transition hover:shadow-md cursor-pointer";

const PADDING_CLASSES: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

/**
 * Compute the full class string for a Card component.
 */
export function getCardClasses(
  variant: CardVariant = "default",
  padding: CardPadding = "md",
): string {
  const parts = [BASE_CLASSES, PADDING_CLASSES[padding]];
  if (variant === "interactive") {
    parts.push(INTERACTIVE_CLASSES);
  }
  return parts.join(" ");
}

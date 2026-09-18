/**
 * Button class mapping logic, extracted for testability.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

/**
 * Compute the full class string for a Button component.
 */
export function getButtonClasses(
  variant: ButtonVariant,
  size: ButtonSize = "md",
  disabled = false,
  loading = false,
): string {
  const parts = [BASE_CLASSES, SIZE_CLASSES[size], VARIANT_CLASSES[variant]];
  if (disabled || loading) {
    parts.push("pointer-events-none opacity-50");
  }
  return parts.join(" ");
}

/**
 * Determine whether the Button should render as <a> or <button>.
 */
export function shouldRenderAsLink(
  href: string | undefined,
  disabled: boolean,
  loading: boolean,
): boolean {
  return !!href && !disabled && !loading;
}

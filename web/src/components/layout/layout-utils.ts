/**
 * Layout class constants, extracted for testability.
 */

export const APPSHELL_CLASSES = "flex min-h-screen";
export const SIDEBAR_WIDTH_EXPANDED = "w-60";
export const SIDEBAR_WIDTH_COLLAPSED = "w-16";
export const MAIN_CLASSES = "flex-1 transition-all duration-200 px-6 py-8";

/** Viewport width (px) below which the sidebar switches to overlay mode. */
export const MOBILE_BREAKPOINT = 768;

/** Horizontal distance (px) a swipe must travel before toggling the sidebar. */
export const SWIPE_THRESHOLD = 50;

/** z-index for the mobile sidebar overlay. */
export const SIDEBAR_Z_INDEX = 50;

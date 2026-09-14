/**
 * Engine state machine for the application shell.
 *
 * Pure functions for detecting engine configuration and health.
 * The state machine determines which view to render on the home page.
 */

// --- Types ---

/** Possible states of the application shell. */
export type EngineState =
  | "checking"
  | "unconfigured"
  | "healthy"
  | "unhealthy";

// --- Constants ---

/** localStorage key: whether the engine has been configured. */
export const STORAGE_KEY_CONFIGURED = "openreview:engineConfigured";

/** localStorage key: the configured engine endpoint URL. */
export const STORAGE_KEY_ENDPOINT = "openreview:engineEndpoint";

/** Default engine endpoint (matches Go engine default port). */
export const DEFAULT_ENDPOINT = "http://127.0.0.1:1234";

// --- Pure functions ---

/**
 * Check whether the engine has been configured (localStorage flag).
 * @returns true if the configured flag is set in localStorage
 */
export function isConfigured(): boolean {
  return localStorage.getItem(STORAGE_KEY_CONFIGURED) === "true";
}

/**
 * Get the configured engine endpoint, falling back to default.
 * @returns the endpoint URL string
 */
export function getConfiguredEndpoint(): string {
  return localStorage.getItem(STORAGE_KEY_ENDPOINT) ?? DEFAULT_ENDPOINT;
}

/**
 * Validate and trim an endpoint string.
 * Returns DEFAULT_ENDPOINT if the input is null, empty, or not a valid URL.
 * @param raw — raw endpoint string from storage or user input
 * @returns validated, trimmed endpoint URL
 */
export function parseEndpoint(raw: string | null): string {
  if (!raw) return DEFAULT_ENDPOINT;

  const trimmed = raw.trim();
  if (!trimmed) return DEFAULT_ENDPOINT;

  // Must have a protocol (http:// or https://)
  if (!/^https?:\/\//.test(trimmed)) return DEFAULT_ENDPOINT;

  return trimmed;
}

// --- Async state machine ---

/**
 * Resolve the current engine state by checking configuration then health.
 * @returns the resolved EngineState
 */
export async function resolveEngineState(): Promise<EngineState> {
  if (!isConfigured()) return "unconfigured";

  const endpoint = parseEndpoint(getConfiguredEndpoint());

  try {
    const response = await fetch(`${endpoint}/api/v1/health`);
    return response.ok ? "healthy" : "unhealthy";
  } catch {
    return "unhealthy";
  }
}

// --- View registry ---

/**
 * Map from engine state to a render function returning HTML string.
 * Each function is a stub — will be replaced with real UI in later phases.
 */
export const VIEWS: Record<EngineState, () => string> = {
  checking: () =>
    '<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>',

  unconfigured: () =>
    '<section class="py-12 text-center"><h1 class="mb-4 text-3xl font-bold">Welcome to OpenReview</h1><p class="mb-8 text-gray-600">Set up your local review engine to get started.</p></section>',

  healthy: () =>
    '<section class="py-12"><h1 class="mb-4 text-3xl font-bold">Dashboard</h1><p class="text-gray-600">Your review projects will appear here.</p></section>',

  unhealthy: () =>
    '<section class="py-12 text-center"><h1 class="mb-4 text-3xl font-bold">Engine Unavailable</h1><p class="mb-8 text-gray-600">Could not reach the review engine. Please check your configuration.</p></section>',
};

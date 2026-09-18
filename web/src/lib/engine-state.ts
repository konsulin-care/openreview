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
  | "not-initialized"
  | "healthy"
  | "unhealthy";

// --- Constants ---

/** localStorage key: whether the engine has been configured. */
export const STORAGE_KEY_CONFIGURED = "openreview:engineConfigured";

/** localStorage key: the configured engine endpoint URL. */
export const STORAGE_KEY_ENDPOINT = "openreview:engineEndpoint";

/** Default engine endpoint (matches Go engine default port). */
export const DEFAULT_ENDPOINT = "http://127.0.0.1:1234";

/** Maximum number of health check retries. */
const MAX_RETRIES = 5;

/** Base delay in ms for exponential backoff. */
const BASE_DELAY_MS = 500;

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

/**
 * Sleep for the specified number of milliseconds.
 * @param ms — milliseconds to wait
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Async state machine ---

import { EngineClient } from "./engine-client";

/**
 * Get the parsed endpoint for the engine client.
 * @returns validated endpoint URL
 */
function getEngineEndpoint(): string {
  return parseEndpoint(getConfiguredEndpoint());
}

/** Lazy-initialized engine client. */
let engineClient: EngineClient | null = null;

/**
 * Get or create the engine client singleton.
 * @returns configured EngineClient instance
 */
function getClient(): EngineClient {
  if (!engineClient) {
    engineClient = new EngineClient({ getEndpoint: getEngineEndpoint });
  }
  return engineClient;
}

/**
 * Check engine health with exponential backoff retry.
 * @returns the resolved EngineState
 */
export async function resolveEngineState(): Promise<EngineState> {
  if (!isConfigured()) return "unconfigured";

  const client = getClient();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const health = await client.getHealth();
      if (health.status === "ok") {
        // Health OK — now check engine state
        const status = await client.getStatus();
        if (status.state === "NEW") {
          return "not-initialized";
        }
        return "healthy";
      }
    } catch {
      // Health check failed — retry with backoff
      if (attempt < MAX_RETRIES - 1) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }
  }

  return "unhealthy";
}

// --- OS detection ---

/** Supported operating systems for onboarding instructions. */
export type OS = "windows" | "macos" | "linux";

/**
 * Detect OS from user agent string.
 * Defaults to linux for unknown or empty strings.
 * @param userAgent — navigator.userAgent value
 * @returns detected OS
 */
export function detectOS(userAgent: string): OS {
  if (!userAgent) return "linux";
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "windows";
  if (ua.includes("macintosh") || ua.includes("mac os")) return "macos";
  return "linux";
}

// --- Stepper rendering ---

/** Step definition for the onboarding stepper. */
interface StepDef {
  label: string;
  key: string;
}

/** Onboarding step definitions. */
const ONBOARDING_STEPS: StepDef[] = [
  { label: "Install", key: "install" },
  { label: "Setup", key: "setup" },
  { label: "Connect", key: "connect" },
  { label: "Initialize", key: "init" },
];

/**
 * Render the stepper progress indicator HTML.
 * @param steps — array of step labels
 * @param activeIndex — zero-based index of the active step
 * @returns HTML string for the stepper
 */
export function renderStepper(steps: string[], activeIndex: number): string {
  const items = steps
    .map((label, i) => {
      let dotClass: string;
      let liClass = "flex items-center gap-2";
      let liAttr = "";

      if (i < activeIndex) {
        // Completed
        dotClass = "bg-green-500";
        liClass += " cursor-pointer hover:opacity-80";
        liAttr = ` data-skip="${i}"`;
      } else if (i === activeIndex) {
        // Active
        dotClass = "border-2 border-blue-600 bg-white";
        liClass += " cursor-pointer";
        liAttr = ` data-skip="${i}"`;
      } else {
        // Pending
        dotClass = "bg-gray-300";
      }

      const textClass = i === activeIndex ? "text-blue-600 font-medium" : i < activeIndex ? "text-green-600" : "text-gray-400";
      return `<li class="${liClass}"${liAttr}>
        <span class="h-3 w-3 rounded-full ${dotClass}"></span>
        <span class="text-sm ${textClass}">${label}</span>
      </li>`;
    })
    .join("");

  return `<ol class="flex items-center gap-4">${items}</ol>`;
}

// --- Onboarding step content ---

/**
 * Render Step 1: Install tools.
 * @param os — detected operating system
 */
function renderInstallStep(os: OS): string {
  const commands: Record<OS, { label: string; cmd: string }[]> = {
    windows: [
      { label: "Git", cmd: "winget install Git.Git" },
      { label: "mise", cmd: "winget install jdx.mise" },
    ],
    macos: [
      { label: "Git", cmd: "brew install git" },
      { label: "mise", cmd: "brew install mise" },
    ],
    linux: [
      { label: "Git", cmd: "sudo apt install git" },
      { label: "mise", cmd: "curl https://mise.run | sh" },
    ],
  };

  const tabs: OS[] = ["windows", "macos", "linux"];
  const tabButtons = tabs
    .map(
      (t) =>
        `<button data-tab="${t}" class="px-3 py-1 text-sm rounded-md ${t === os ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}">${t === "windows" ? "Windows" : t === "macos" ? "macOS" : "Linux"}</button>`
    )
    .join("");

  const osSections = tabs
    .map((t) => {
      const cmds = commands[t]
        .map(
          (c) =>
            `<div class="flex items-center gap-2">
              <code class="flex-1 rounded bg-gray-100 px-3 py-2 text-sm font-mono" data-cmd>${c.cmd}</code>
              <button data-copy class="shrink-0 rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-300">Copy</button>
            </div>`
        )
        .join("");
      return `<div data-os-section="${t}" class="space-y-2 ${t !== os ? "hidden" : ""}">${cmds}</div>`;
    })
    .join("");

  return `
    <div class="space-y-4">
      <p class="text-sm text-gray-600">Install the required tools for your operating system.</p>
      <div class="flex gap-1" data-os-tabs>${tabButtons}</div>
      ${osSections}
      <div class="flex items-center justify-between pt-2">
        <button data-skip class="text-sm text-gray-500 hover:text-gray-700">I already have these installed</button>
        <button data-next class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Next</button>
      </div>
    </div>`;
}

/**
 * Render Step 2: Clone & setup.
 * @param os — detected operating system
 */
function renderSetupStep(os: OS): string {
  const terminalHint: Record<OS, string> = {
    windows: "Start menu \u2192 PowerShell",
    macos: "Spotlight \u223C Terminal",
    linux: "Applications \u2192 Terminal",
  };

  const commands = [
    `# Open a terminal (${terminalHint[os]})`,
    "git clone https://github.com/konsulin-care/openreview",
    "cd openreview",
    "mise install && mise run init",
    "mise run dev",
  ];

  const codeBlock = commands.join("\n");

  return `
    <div class="space-y-4">
      <p class="text-sm text-gray-600">Clone the repository and start the engine.</p>
      <div class="relative">
        <pre class="overflow-x-auto rounded bg-gray-100 p-4 text-sm text-gray-900 font-mono">${codeBlock}</pre>
        <button data-copy-all class="absolute top-2 right-2 rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-300">Copy all</button>
      </div>
    </div>`;
}

/**
 * Render Step 3: Connect.
 */
function renderConnectStep(): string {
  return `
    <div class="space-y-4">
      <p class="text-sm text-gray-600">Enter your engine endpoint URL.</p>
      <div class="flex gap-2">
        <input type="text" data-endpoint value="http://127.0.0.1:1234" class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <button data-test-connection class="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300">Test</button>
      </div>
      <div data-connection-status class="hidden text-sm"></div>
    </div>`;
}

/**
 * Render Step 4: Initialize.
 */
function renderInitStep(): string {
  return `
    <div class="space-y-4">
      <p class="text-sm text-gray-600">Set up your reviewer profile.</p>
      <div>
        <label for="actor-name" class="mb-1 block text-sm font-medium text-gray-700">Reviewer Name</label>
        <input type="text" id="actor-name" required class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Your name" />
      </div>
      <div>
        <label for="actor-email" class="mb-1 block text-sm font-medium text-gray-700">Reviewer Email</label>
        <input type="email" id="actor-email" required class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="you@example.com" />
      </div>
      <div data-init-error class="hidden rounded bg-red-50 p-3 text-sm text-red-700"></div>
      <div class="flex justify-end">
        <button data-init-submit class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Initialize</button>
      </div>
    </div>`;
}

/**
 * Build the full onboarding wizard HTML.
 * @param startStep — zero-based index of the step to start at
 */
export function renderOnboardingWizard(startStep: number): string {
  const os = typeof navigator !== "undefined" ? detectOS(navigator.userAgent) : "linux";
  const stepLabels = ONBOARDING_STEPS.map((s) => s.label);
  const stepper = renderStepper(stepLabels, startStep);

  const steps = [
    renderInstallStep(os),
    renderSetupStep(os),
    renderConnectStep(),
    renderInitStep(),
  ];

  const activeCard = `<div data-wizard-card class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">${steps[startStep]}</div>`;

  return `
    <section class="mx-auto max-w-2xl py-12">
      <h1 class="mb-2 text-3xl font-bold">Welcome to OpenReview</h1>
      <p class="mb-6 text-gray-600">Set up your local review engine to get started.</p>
      <div class="mb-6">${stepper}</div>
      <div data-wizard-card-container>${activeCard}</div>
    </section>`;
}

// --- View registry ---

/**
 * Map from engine state to a render function returning HTML string.
 */
export const VIEWS: Record<EngineState, () => string> = {
  checking: () =>
    '<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>',

  unconfigured: () => renderOnboardingWizard(0),

  "not-initialized": () => renderOnboardingWizard(3),

  healthy: () =>
    `<section>
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <button id="new-project-btn" type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ New Project</button>
      </div>

      <div id="selection-bar" class="hidden sticky top-0 z-40 mt-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
        <span id="selection-count" class="text-sm font-medium text-blue-900"></span>
        <div class="flex items-center gap-3">
          <button id="clear-selection" type="button" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Clear</button>
          <button id="delete-selected" type="button" class="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete (<span id="delete-count">0</span>)
          </button>
        </div>
      </div>

      <div id="project-grid" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"></div>

      <div id="empty-state" class="hidden py-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <h2 class="mt-4 text-lg font-semibold text-gray-900">No projects yet</h2>
        <p class="mt-1 text-sm text-gray-500">Create your first project to start screening papers.</p>
        <button id="empty-state-cta" type="button" class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create Project</button>
      </div>

      <div id="create-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center">
        <div id="modal-backdrop" class="absolute inset-0 bg-black/50"></div>
        <div class="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-gray-900">New Project</h2>
          <div class="mt-4">
            <label for="project-name" class="block text-sm font-medium text-gray-700">Project Name</label>
            <input type="text" id="project-name" class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g., Systematic Review 2026" />
          </div>
          <div id="modal-error" class="hidden mt-3 rounded bg-red-50 p-3 text-sm text-red-700"></div>
          <div class="mt-6 flex justify-end gap-3">
            <button id="modal-cancel" type="button" class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button id="modal-create" type="button" class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create</button>
          </div>
        </div>
      </div>

      <div id="delete-confirm-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center">
        <div id="delete-modal-backdrop" class="absolute inset-0 bg-black/50"></div>
        <div class="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-gray-900">Delete Projects</h2>
          <p id="delete-confirm-text" class="mt-2 text-sm text-gray-600"></p>
          <div id="delete-confirm-error" class="hidden mt-3 rounded bg-red-50 p-3 text-sm text-red-700"></div>
          <div class="mt-6 flex justify-end gap-3">
            <button id="delete-confirm-cancel" type="button" class="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button id="delete-confirm-submit" type="button" class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </section>`, 

  unhealthy: () =>
    '<section class="py-12 text-center"><h1 class="mb-4 text-3xl font-bold">Engine Unavailable</h1><p class="mb-8 text-gray-600">Could not reach the review engine. Please check your configuration.</p><p class="text-gray-500">Run <code class="rounded bg-gray-100 px-2 py-1">mise run dev</code> to start the engine.</p></section>',
};

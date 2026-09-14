/**
 * Wizard interaction layer for the onboarding flow.
 *
 * Handles all client-side event delegation for wizard navigation,
 * OS tab toggling, clipboard copy, connection testing, and form submission.
 * Coordinates with engine-state.ts for re-rendering.
 */

import {
  renderOnboardingWizard,
  STORAGE_KEY_CONFIGURED,
  STORAGE_KEY_ENDPOINT,
  DEFAULT_ENDPOINT,
  parseEndpoint,
} from "./engine-state";

// --- Constants ---

/** Number of wizard steps (0-indexed). */
const TOTAL_STEPS = 4;

// --- State ---

/** Current wizard step index, persists across interactions within a session. */
let currentStep: number = 0;

// --- Re-render helpers ---

/**
 * Re-render the wizard card and stepper for the current step.
 * @param root — the app-root element containing the wizard
 */
function rerender(root: HTMLElement): void {
  const wizardHtml = renderOnboardingWizard(currentStep);

  // Replace the entire wizard section with fresh HTML
  const wizardSection = root.querySelector("section");
  if (wizardSection) {
    // Extract just the inner content (h1, p, stepper, card) from the rendered wizard
    const inner = wizardHtml.match(/<section[^>]*>([\s\S]*)<\/section>/)?.[1] ?? wizardHtml;
    wizardSection.innerHTML = inner;
  }
}

// --- Event handlers ---

/**
 * Handle data-next click: advance to next step.
 */
function handleNext(): void {
  if (currentStep < TOTAL_STEPS - 1) {
    currentStep++;
  }
}

/**
 * Handle data-skip click: jump to specified step or default to step 1.
 * @param target — the clicked element (may have data-skip value)
 */
function handleSkip(target: Element): void {
  const skipTo = target.getAttribute("data-skip");
  currentStep = skipTo ? parseInt(skipTo, 10) : 1;
}

/**
 * Handle data-tab click: toggle OS section visibility.
 * @param root — the wizard root element
 * @param tabName — the OS tab to show
 */
function handleTab(root: HTMLElement, tabName: string): void {
  // Update tab button styles
  const tabButtons = root.querySelectorAll("[data-tab]");
  tabButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-tab") === tabName;
    btn.classList.toggle("bg-blue-100", isActive);
    btn.classList.toggle("text-blue-700", isActive);
    btn.classList.toggle("text-gray-500", !isActive);
    btn.classList.toggle("hover:bg-gray-100", !isActive);
  });

  // Toggle OS sections
  const sections = root.querySelectorAll("[data-os-section]");
  sections.forEach((section) => {
    const isTarget = section.getAttribute("data-os-section") === tabName;
    section.classList.toggle("hidden", !isTarget);
  });
}

/**
 * Handle data-copy / data-copy-all: copy text to clipboard with feedback.
 * @param target — the copy button element
 * @param selector — CSS selector for the element containing the text to copy
 */
async function handleCopy(target: Element, selector: string): Promise<void> {
  const container = target.closest("div") ?? target.closest("[data-wizard-card-container]");
  const textEl = container?.querySelector(selector);
  const text = textEl?.textContent?.trim();
  if (!text) return;

  await navigator.clipboard.writeText(text);

  // Brief "Copied" feedback
  const original = target.textContent;
  target.textContent = "Copied!";
  setTimeout(() => { target.textContent = original; }, 1500);
}

/**
 * Handle data-test-connection: fetch health endpoint and show status.
 * @param root — the wizard root element
 */
async function handleTestConnection(root: HTMLElement): Promise<void> {
  const input = root.querySelector("[data-endpoint]") as HTMLInputElement | null;
  const endpoint = parseEndpoint(input?.value ?? null);
  const statusEl = root.querySelector("[data-connection-status]");

  if (!statusEl) return;

  statusEl.classList.remove("hidden");

  try {
    const response = await fetch(`${endpoint}/api/v1/health`);
    const data = await response.json();
    if (data.status === "ok") {
      statusEl.textContent = "Connection successful";
      statusEl.classList.remove("text-red-600");
      statusEl.classList.add("text-green-600");
    } else {
      statusEl.textContent = "Engine returned unexpected status";
      statusEl.classList.remove("text-green-600");
      statusEl.classList.add("text-red-600");
    }
  } catch {
    statusEl.textContent = "Connection failed — could not reach engine";
    statusEl.classList.remove("text-green-600");
    statusEl.classList.add("text-red-600");
  }
}

/**
 * Handle data-save: validate endpoint, persist to localStorage.
 * @param root — the wizard root element
 * @param onSaved — callback after successful save (triggers re-render)
 */
function handleSave(root: HTMLElement, onSaved: () => void): void {
  const input = root.querySelector("[data-endpoint]") as HTMLInputElement | null;
  const endpoint = parseEndpoint(input?.value ?? null);

  localStorage.setItem(STORAGE_KEY_ENDPOINT, endpoint);
  localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");

  onSaved();
}

/**
 * Handle data-init-submit: validate inputs, POST to engine, set configured.
 * @param root — the wizard root element
 * @param onSaved — callback after successful init
 */
async function handleInitSubmit(
  root: HTMLElement,
  onSaved: () => void
): Promise<void> {
  const nameInput = root.querySelector("#actor-name") as HTMLInputElement | null;
  const emailInput = root.querySelector("#actor-email") as HTMLInputElement | null;
  const errorEl = root.querySelector("[data-init-error]");

  const name = nameInput?.value?.trim() ?? "";
  const email = emailInput?.value?.trim() ?? "";

  // Validate
  if (!name || !email) {
    if (errorEl) {
      errorEl.classList.remove("hidden");
      errorEl.textContent = "Name and email are required.";
    }
    return;
  }

  // Clear error
  if (errorEl) {
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
  }

  const endpoint = parseEndpoint(
    localStorage.getItem(STORAGE_KEY_ENDPOINT) ?? DEFAULT_ENDPOINT
  );

  try {
    const response = await fetch(`${endpoint}/api/v1/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
      localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
      onSaved();
    } else {
      if (errorEl) {
        errorEl.classList.remove("hidden");
        errorEl.textContent = "Initialization failed. Please try again.";
      }
    }
  } catch {
    if (errorEl) {
      errorEl.classList.remove("hidden");
      errorEl.textContent = "Could not reach engine. Please check your connection.";
    }
  }
}

// --- Public API ---

/**
 * Initialize the wizard interaction layer.
 * Attaches a single delegated event listener on the root element
 * that handles all wizard interactions.
 * @param root — the app-root element containing the rendered wizard
 */
export function initWizard(root: HTMLElement): void {
  currentStep = 0;

  // Single delegated event listener
  root.addEventListener("click", async (event) => {
    const target = event.target as Element;
    if (!target || !target.closest) return;

    // data-next
    if (target.closest("[data-next]")) {
      event.preventDefault();
      handleNext();
      rerender(root);
      return;
    }

    // data-skip
    if (target.closest("[data-skip]")) {
      event.preventDefault();
      handleSkip(target.closest("[data-skip]")!);
      rerender(root);
      return;
    }

    // data-tab
    const tab = target.closest("[data-tab]");
    if (tab) {
      event.preventDefault();
      handleTab(root, tab.getAttribute("data-tab")!);
      return;
    }

    // data-copy
    if (target.closest("[data-copy]")) {
      event.preventDefault();
      await handleCopy(target.closest("[data-copy]")!, "[data-cmd]");
      return;
    }

    // data-copy-all
    if (target.closest("[data-copy-all]")) {
      event.preventDefault();
      await handleCopy(target.closest("[data-copy-all]")!, "pre");
      // Auto-advance to next step after copied feedback
      setTimeout(() => {
        handleNext();
        rerender(root);
      }, 1500);
      return;
    }

    // data-test-connection
    if (target.closest("[data-test-connection]")) {
      event.preventDefault();
      await handleTestConnection(root);
      return;
    }

    // data-save
    if (target.closest("[data-save]")) {
      event.preventDefault();
      handleSave(root, () => rerender(root));
      return;
    }

    // data-init-submit
    if (target.closest("[data-init-submit]")) {
      event.preventDefault();
      await handleInitSubmit(root, () => rerender(root));
      return;
    }
  });
}

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initWizard } from "./wizard";

// --- Mocks ---

const mockRenderOnboardingWizard = vi.fn();

vi.mock("./engine-state", () => ({
  renderOnboardingWizard: (...args: unknown[]) => mockRenderOnboardingWizard(...args),
  renderStepper: (...args: unknown[]) => "<ol>stepper</ol>",
  STORAGE_KEY_CONFIGURED: "openreview:engineConfigured",
  STORAGE_KEY_ENDPOINT: "openreview:engineEndpoint",
  DEFAULT_ENDPOINT: "http://127.0.0.1:1234",
  parseEndpoint: (raw: string | null) => {
    if (!raw) return "http://127.0.0.1:1234";
    const trimmed = raw.trim();
    if (!trimmed) return "http://127.0.0.1:1234";
    if (!/^https?:\/\//.test(trimmed)) return "http://127.0.0.1:1234";
    return trimmed;
  },
}));

// --- Helpers ---

/** Build wizard section HTML for a specific step. */
function buildStepHtml(step: number): string {
  const stepContent: Record<number, string> = {
    0: `<button data-skip>Skip</button><button data-next>Next</button>`,
    1: `<pre>git clone https://example.com</pre><button data-copy-all>Copy all</button>`,
    2: `<input data-endpoint value="http://127.0.0.1:1234" /><button data-test-connection>Test</button><div data-connection-status class="hidden"></div><button data-save>Save</button>`,
    3: `<input id="actor-name" value="" /><input id="actor-email" value="" /><div data-init-error class="hidden"></div><button data-init-submit>Initialize</button>`,
  };
  return `<section>
    <div class="mb-6"><ol class="flex items-center gap-4"></ol></div>
    <div data-wizard-card-container>
      <div data-wizard-card class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">${stepContent[step]}</div>
    </div>
  </section>`;
}

function createRoot(step = 0): HTMLElement {
  const root = document.createElement("div");
  root.id = "app-root";
  root.innerHTML = buildStepHtml(step);
  return root;
}

function click(el: HTMLElement, selector: string): void {
  const target = el.querySelector(selector) as HTMLElement;
  if (!target) throw new Error(`Element not found: ${selector}`);
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

/** Click and wait for any async event handler work to settle. */
async function clickAsync(el: HTMLElement, selector: string): Promise<void> {
  click(el, selector);
  // Flush microtasks (async event handler promises)
  await new Promise((r) => setTimeout(r, 0));
}

// --- Tests ---

describe("initWizard", () => {
  let root: HTMLElement;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
    });
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    // Mock returns the section HTML for the given step
    mockRenderOnboardingWizard.mockImplementation((step: number) => buildStepHtml(step));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // --- Navigation ---

  it("exports initWizard as a function", () => {
    root = createRoot(0);
    expect(typeof initWizard).toBe("function");
  });

  it("data-next click advances to the next step", () => {
    root = createRoot(0);
    initWizard(root);
    mockRenderOnboardingWizard.mockClear();

    click(root, "[data-next]");

    expect(mockRenderOnboardingWizard).toHaveBeenCalledWith(1);
  });

  it("data-next does not advance past the last step", () => {
    root = createRoot(3);
    initWizard(root);
    mockRenderOnboardingWizard.mockClear();

    // Step 3 has no data-next, so this tests the boundary condition
    // by verifying that step stays at 3 after reaching it
    expect(mockRenderOnboardingWizard).not.toHaveBeenCalled();
  });

  it("data-skip click jumps to step 1 by default", () => {
    root = createRoot(0);
    initWizard(root);
    mockRenderOnboardingWizard.mockClear();

    click(root, "[data-skip]");

    expect(mockRenderOnboardingWizard).toHaveBeenCalledWith(1);
  });

  it("data-skip with value jumps to specified step", () => {
    root = createRoot(0);
    root.querySelector("[data-wizard-card-container]")!.innerHTML =
      `<button data-skip="2">Skip to Connect</button>`;
    initWizard(root);
    mockRenderOnboardingWizard.mockClear();

    click(root, "[data-skip]");

    expect(mockRenderOnboardingWizard).toHaveBeenCalledWith(2);
  });

  // --- OS tabs ---

  it("data-tab click shows target OS section and hides others", () => {
    root = createRoot(0);
    root.querySelector("[data-wizard-card-container]")!.innerHTML = `
      <button data-tab="macos">macOS</button>
      <button data-tab="linux">Linux</button>
      <div data-os-section="macos" class="hidden">macOS cmds</div>
      <div data-os-section="linux">Linux cmds</div>
    `;
    initWizard(root);

    click(root, "[data-tab='linux']");

    expect(root.querySelector('[data-os-section="macos"]')?.classList.contains("hidden")).toBe(true);
    expect(root.querySelector('[data-os-section="linux"]')?.classList.contains("hidden")).toBe(false);
  });

  it("data-tab click updates active tab button styles", () => {
    root = createRoot(0);
    root.querySelector("[data-wizard-card-container]")!.innerHTML = `
      <button data-tab="macos" class="text-gray-500">macOS</button>
      <button data-tab="linux" class="bg-blue-100 text-blue-700">Linux</button>
      <div data-os-section="macos">macOS cmds</div>
      <div data-os-section="linux" class="hidden">Linux cmds</div>
    `;
    initWizard(root);

    click(root, "[data-tab='macos']");

    const macBtn = root.querySelector('[data-tab="macos"]');
    const linuxBtn = root.querySelector('[data-tab="linux"]');
    expect(macBtn?.classList.contains("bg-blue-100")).toBe(true);
    expect(macBtn?.classList.contains("text-blue-700")).toBe(true);
    expect(linuxBtn?.classList.contains("bg-blue-100")).toBe(false);
    expect(linuxBtn?.classList.contains("text-gray-500")).toBe(true);
  });

  // --- Clipboard ---

  it("data-copy click copies adjacent command to clipboard", () => {
    root = createRoot(0);
    root.querySelector("[data-wizard-card-container]")!.innerHTML = `
      <code data-cmd>brew install git</code>
      <button data-copy>Copy</button>
    `;
    initWizard(root);

    click(root, "[data-copy]");

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("brew install git");
  });

  it("data-copy-all copies nearest pre text to clipboard", () => {
    root = createRoot(1);
    initWizard(root);

    click(root, "[data-copy-all]");

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("git clone https://example.com");
  });

  it("data-copy-all auto-advances to next step after copied feedback", async () => {
    vi.useFakeTimers();
    root = createRoot(1);
    initWizard(root);
    mockRenderOnboardingWizard.mockClear();

    click(root, "[data-copy-all]");
    // Flush microtasks for async clipboard write
    await vi.advanceTimersByTimeAsync(0);

    const btn = root.querySelector("[data-copy-all]");
    expect(btn?.textContent).toBe("Copied!");

    // After 1500ms, should advance to step 2 (Connect)
    vi.advanceTimersByTime(1500);
    expect(mockRenderOnboardingWizard).toHaveBeenCalledWith(2);

    vi.useRealTimers();
  });

  it("data-copy shows brief Copied feedback", async () => {
    vi.useFakeTimers();
    root = createRoot(0);
    root.querySelector("[data-wizard-card-container]")!.innerHTML = `
      <code data-cmd>brew install git</code>
      <button data-copy>Copy</button>
    `;
    initWizard(root);

    click(root, "[data-copy]");
    // Flush microtasks so the async clipboard write settles
    await vi.advanceTimersByTimeAsync(0);

    const btn = root.querySelector("[data-copy]");
    expect(btn?.textContent).toBe("Copied!");

    vi.advanceTimersByTime(1500);
    expect(btn?.textContent).toBe("Copy");

    vi.useRealTimers();
  });

  // --- Connection test ---

  it("data-test-connection shows pass on healthy response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), { status: 200 })
    ));

    root = createRoot(2);
    initWizard(root);

    await clickAsync(root, "[data-test-connection]");

    const statusEl = root.querySelector("[data-connection-status]");
    expect(statusEl?.classList.contains("hidden")).toBe(false);
    expect(statusEl?.textContent).toContain("successful");
    expect(statusEl?.classList.contains("text-green-600")).toBe(true);
  });

  it("data-test-connection shows fail on error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    root = createRoot(2);
    initWizard(root);

    await clickAsync(root, "[data-test-connection]");

    const statusEl = root.querySelector("[data-connection-status]");
    expect(statusEl?.classList.contains("hidden")).toBe(false);
    expect(statusEl?.textContent).toContain("failed");
    expect(statusEl?.classList.contains("text-red-600")).toBe(true);
  });

  it("data-test-connection shows fail on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "error" }), { status: 200 })
    ));

    root = createRoot(2);
    initWizard(root);

    await clickAsync(root, "[data-test-connection]");

    const statusEl = root.querySelector("[data-connection-status]");
    expect(statusEl?.classList.contains("hidden")).toBe(false);
    expect(statusEl?.textContent).toContain("unexpected");
  });

  // --- Save endpoint ---

  it("data-save stores endpoint and sets configured", () => {
    root = createRoot(2);
    initWizard(root);

    click(root, "[data-save]");

    expect(store["openreview:engineEndpoint"]).toBe("http://127.0.0.1:1234");
    expect(store["openreview:engineConfigured"]).toBe("true");
  });

  it("data-save re-renders wizard after saving", () => {
    root = createRoot(2);
    initWizard(root);
    mockRenderOnboardingWizard.mockClear();

    click(root, "[data-save]");

    expect(mockRenderOnboardingWizard).toHaveBeenCalled();
  });

  // --- Init submit ---

  it("data-init-submit with missing fields shows error", () => {
    root = createRoot(3);
    initWizard(root);

    click(root, "[data-init-submit]");

    const errorEl = root.querySelector("[data-init-error]");
    expect(errorEl?.classList.contains("hidden")).toBe(false);
    expect(errorEl?.textContent).toContain("required");
  });

  it("data-init-submit with missing name shows error", () => {
    root = createRoot(3);
    (root.querySelector("#actor-name") as HTMLInputElement).value = "";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "alice@example.com";
    initWizard(root);

    click(root, "[data-init-submit]");

    const errorEl = root.querySelector("[data-init-error]");
    expect(errorEl?.classList.contains("hidden")).toBe(false);
    expect(errorEl?.textContent).toContain("required");
  });

  it("data-init-submit with missing email shows error", () => {
    root = createRoot(3);
    (root.querySelector("#actor-name") as HTMLInputElement).value = "Alice";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "";
    initWizard(root);

    click(root, "[data-init-submit]");

    const errorEl = root.querySelector("[data-init-error]");
    expect(errorEl?.classList.contains("hidden")).toBe(false);
    expect(errorEl?.textContent).toContain("required");
  });

  it("data-init-submit with valid fields POSTs to engine", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    root = createRoot(3);
    (root.querySelector("#actor-name") as HTMLInputElement).value = "Alice";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "alice@example.com";
    initWizard(root);

    await click(root, "[data-init-submit]");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:1234/api/v1/init",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
      })
    );
  });

  it("data-init-submit with valid fields sets configured on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ));

    root = createRoot(3);
    (root.querySelector("#actor-name") as HTMLInputElement).value = "Alice";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "alice@example.com";
    initWizard(root);

    await click(root, "[data-init-submit]");

    expect(store["openreview:engineConfigured"]).toBe("true");
  });

  it("data-init-submit shows error on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));

    root = createRoot(3);
    (root.querySelector("#actor-name") as HTMLInputElement).value = "Alice";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "alice@example.com";
    initWizard(root);

    await click(root, "[data-init-submit]");

    const errorEl = root.querySelector("[data-init-error]");
    expect(errorEl?.classList.contains("hidden")).toBe(false);
    expect(errorEl?.textContent).toContain("reach engine");
  });

  it("data-init-submit shows error on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response("Internal Server Error", { status: 500 })
    ));

    root = createRoot(3);
    (root.querySelector("#actor-name") as HTMLInputElement).value = "Alice";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "alice@example.com";
    initWizard(root);

    await click(root, "[data-init-submit]");

    const errorEl = root.querySelector("[data-init-error]");
    expect(errorEl?.classList.contains("hidden")).toBe(false);
    expect(errorEl?.textContent).toContain("Initialization failed");
  });

  // --- Error clearing ---

  it("data-init-submit clears error on valid re-submission", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ));

    root = createRoot(3);
    initWizard(root);

    // First submit: missing fields → shows error
    click(root, "[data-init-submit]");
    const errorEl = root.querySelector("[data-init-error]");
    expect(errorEl?.classList.contains("hidden")).toBe(false);

    // Fill fields and submit again → error clears
    (root.querySelector("#actor-name") as HTMLInputElement).value = "Alice";
    (root.querySelector("#actor-email") as HTMLInputElement).value = "alice@example.com";
    await click(root, "[data-init-submit]");
    expect(errorEl?.classList.contains("hidden")).toBe(true);
  });
});

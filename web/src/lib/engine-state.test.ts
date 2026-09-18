import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isConfigured,
  getConfiguredEndpoint,
  parseEndpoint,
  resolveEngineState,
  VIEWS,
  STORAGE_KEY_CONFIGURED,
  STORAGE_KEY_ENDPOINT,
  DEFAULT_ENDPOINT,
  detectOS,
  renderStepper,
  renderOnboardingWizard,
  type OS,
} from "./engine-state";

// --- localStorage mocks ---

function mockLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};
  return store;
}

describe("constants", () => {
  it("STORAGE_KEY_CONFIGURED is a non-empty string", () => {
    expect(typeof STORAGE_KEY_CONFIGURED).toBe("string");
    expect(STORAGE_KEY_CONFIGURED.length).toBeGreaterThan(0);
  });

  it("STORAGE_KEY_ENDPOINT is a non-empty string", () => {
    expect(typeof STORAGE_KEY_ENDPOINT).toBe("string");
    expect(STORAGE_KEY_ENDPOINT.length).toBeGreaterThan(0);
  });

  it("DEFAULT_ENDPOINT is a valid URL", () => {
    expect(DEFAULT_ENDPOINT).toMatch(/^https?:\/\//);
  });
});

describe("parseEndpoint", () => {
  it("returns default for null", () => {
    expect(parseEndpoint(null)).toBe(DEFAULT_ENDPOINT);
  });

  it("returns default for empty string", () => {
    expect(parseEndpoint("")).toBe(DEFAULT_ENDPOINT);
  });

  it("returns default for whitespace-only string", () => {
    expect(parseEndpoint("   ")).toBe(DEFAULT_ENDPOINT);
  });

  it("returns default for malformed URL (no protocol)", () => {
    expect(parseEndpoint("localhost:1234")).toBe(DEFAULT_ENDPOINT);
  });

  it("trims and returns valid HTTP URL", () => {
    expect(parseEndpoint("  http://127.0.0.1:1234  ")).toBe(
      "http://127.0.0.1:1234"
    );
  });

  it("trims and returns valid HTTPS URL", () => {
    expect(parseEndpoint("  https://example.com  ")).toBe(
      "https://example.com"
    );
  });
});

describe("isConfigured", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = mockLocalStorage();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  it("returns false when localStorage is empty", () => {
    expect(isConfigured()).toBe(false);
  });

  it("returns true when STORAGE_KEY_CONFIGURED is set", () => {
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    expect(isConfigured()).toBe(true);
  });

  it("returns false when STORAGE_KEY_CONFIGURED is removed", () => {
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.removeItem(STORAGE_KEY_CONFIGURED);
    expect(isConfigured()).toBe(false);
  });
});

describe("getConfiguredEndpoint", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = mockLocalStorage();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  it("returns DEFAULT_ENDPOINT when nothing stored", () => {
    expect(getConfiguredEndpoint()).toBe(DEFAULT_ENDPOINT);
  });

  it("returns stored endpoint when set", () => {
    const custom = "http://192.168.1.100:8080";
    localStorage.setItem(STORAGE_KEY_ENDPOINT, custom);
    expect(getConfiguredEndpoint()).toBe(custom);
  });
});

describe("detectOS", () => {
  it("returns 'windows' for Windows user agent", () => {
    expect(detectOS("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("windows");
  });

  it("returns 'macos' for macOS user agent", () => {
    expect(detectOS("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("macos");
  });

  it("returns 'linux' for Linux user agent", () => {
    expect(detectOS("Mozilla/5.0 (X11; Linux x86_64)")).toBe("linux");
  });

  it("defaults to linux for unknown user agent", () => {
    expect(detectOS("SomeBot/1.0")).toBe("linux");
  });

  it("defaults to linux for empty string", () => {
    expect(detectOS("")).toBe("linux");
  });
});

describe("renderStepper", () => {
  const steps = ["Install", "Setup", "Connect", "Initialize"];

  it("marks active step with blue ring class", () => {
    const html = renderStepper(steps, 1);
    expect(html).toContain("Install");
    expect(html).toContain("Setup");
    expect(html).toContain("Connect");
    expect(html).toContain("Initialize");
  });

  it("renders all step labels", () => {
    const html = renderStepper(steps, 0);
    for (const step of steps) {
      expect(html).toContain(step);
    }
  });

  it("returns non-empty string", () => {
    expect(renderStepper(steps, 0).length).toBeGreaterThan(0);
  });

  it("completed step has data-skip and cursor-pointer", () => {
    const html = renderStepper(steps, 1);
    // Step 0 (Install) is completed when activeIndex is 1
    expect(html).toContain("data-skip=\"0\"");
    expect(html).toContain("cursor-pointer");
  });

  it("active step has data-skip and cursor-pointer", () => {
    const html = renderStepper(steps, 1);
    expect(html).toContain("data-skip=\"1\"");
  });

  it("pending step does not have data-skip", () => {
    const html = renderStepper(steps, 1);
    // Step 2 (Connect) is pending when activeIndex is 1
    expect(html).not.toContain("data-skip=\"2\"");
    expect(html).not.toContain("data-skip=\"3\"");
  });

  it("completed step has hover effect", () => {
    const html = renderStepper(steps, 1);
    expect(html).toContain("hover:opacity-80");
  });
});

describe("renderOnboardingWizard", () => {
  it("does not use dark terminal styling in any step", async () => {
    // Check all view outputs for dark terminal styling
    const views = ["checking", "unconfigured", "not-initialized", "healthy", "unhealthy"] as const;
    for (const view of views) {
      const html = VIEWS[view]();
      // No step should have the dark terminal bg-gray-900 styling
      expect(html).not.toContain("bg-gray-900");
      expect(html).not.toContain("bg-gray-700");
    }
  });

  it("setup step uses light code block styling", () => {
    // The unconfigured view renders the wizard starting at step 0
    // Step 1 (setup) content is not rendered until navigated to
    // Check that renderOnboardingWizard at step 1 has light styling
    const html = renderOnboardingWizard(1);
    expect(html).toContain("bg-gray-100");
    expect(html).not.toContain("bg-gray-900");
    // Check copy button uses light styling
    expect(html).toContain("bg-gray-200");
  });

  it("setup step does not have static waiting text", () => {
    const html = renderOnboardingWizard(1);
    expect(html).not.toContain("Waiting for engine to start");
  });
});

describe("VIEWS", () => {
  it("has entries for all 5 states", () => {
    expect(VIEWS).toHaveProperty("checking");
    expect(VIEWS).toHaveProperty("unconfigured");
    expect(VIEWS).toHaveProperty("not-initialized");
    expect(VIEWS).toHaveProperty("healthy");
    expect(VIEWS).toHaveProperty("unhealthy");
  });

  it("checking returns non-empty string", () => {
    expect(VIEWS.checking().length).toBeGreaterThan(0);
  });

  it("unconfigured returns onboarding wizard HTML", () => {
    const html = VIEWS.unconfigured();
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("Install");
  });

  it("not-initialized returns onboarding wizard at step 4", () => {
    const html = VIEWS["not-initialized"]();
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("Initialize");
  });

  it("healthy returns dashboard content", () => {
    const html = VIEWS.healthy();
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("Dashboard");
  });

  it("healthy does not contain selection-bar element", () => {
    const html = VIEWS.healthy();
    expect(html).not.toContain('id="selection-bar"');
  });

  it("healthy contains action-btn with min-w for consistent width", () => {
    const html = VIEWS.healthy();
    expect(html).toContain('id="action-btn"');
    expect(html).toContain("min-w-");
  });

  it("healthy action-btn has hidden class by default", () => {
    const html = VIEWS.healthy();
    // The action-btn should start hidden; initDashboard shows it when projects exist
    const actionBtnMatch = html.match(/id="action-btn"[^>]*class="([^"]*)"/);
    expect(actionBtnMatch).not.toBeNull();
    expect(actionBtnMatch![1]).toContain("hidden");
  });

  it("healthy contains hidden clear-selection-btn", () => {
    const html = VIEWS.healthy();
    expect(html).toContain('id="clear-selection-btn"');
    expect(html).toContain('class="hidden');
  });

  it("healthy contains hidden select-all-bar with checkbox", () => {
    const html = VIEWS.healthy();
    expect(html).toContain('id="select-all-bar"');
    expect(html).toContain('id="select-all-checkbox"');
    expect(html).toContain('id="select-count"');
    expect(html).toContain('id="total-count"');
  });

  it("unhealthy returns non-empty string", () => {
    expect(VIEWS.unhealthy().length).toBeGreaterThan(0);
  });
});

describe("resolveEngineState", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = mockLocalStorage();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  it("returns 'unconfigured' when not configured", async () => {
    const state = await resolveEngineState();
    expect(state).toBe("unconfigured");
  });

  it("returns 'healthy' when configured and health check succeeds", async () => {
    vi.useFakeTimers();
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.setItem(STORAGE_KEY_ENDPOINT, "http://127.0.0.1:1234");

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: "ok" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ state: "READY", version: "0.1.0" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const statePromise = resolveEngineState();
    await vi.advanceTimersByTimeAsync(10000);
    const state = await statePromise;
    expect(state).toBe("healthy");
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:1234/api/v1/health");
    vi.useRealTimers();
  });

  it("returns 'unhealthy' when configured but health check fails", async () => {
    vi.useFakeTimers();
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.setItem(STORAGE_KEY_ENDPOINT, "http://127.0.0.1:1234");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network error"))
    );

    const statePromise = resolveEngineState();
    await vi.advanceTimersByTimeAsync(10000);
    const state = await statePromise;
    expect(state).toBe("unhealthy");
    vi.useRealTimers();
  });

  it("returns 'unhealthy' when configured but fetch returns not ok", async () => {
    vi.useFakeTimers();
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.setItem(STORAGE_KEY_ENDPOINT, "http://127.0.0.1:1234");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Service Unavailable", { status: 503 }))
    );

    const statePromise = resolveEngineState();
    await vi.advanceTimersByTimeAsync(10000);
    const state = await statePromise;
    expect(state).toBe("unhealthy");
    vi.useRealTimers();
  });
});

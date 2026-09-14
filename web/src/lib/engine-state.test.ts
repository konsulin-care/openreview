import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isConfigured,
  getConfiguredEndpoint,
  parseEndpoint,
  resolveEngineState,
  VIEWS,
  STORAGE_KEY_CONFIGURED,
  STORAGE_KEY_ENDPOINT,
  DEFAULT_ENDPOINT,
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

describe("VIEWS", () => {
  it("has entries for all 4 states", () => {
    expect(VIEWS).toHaveProperty("checking");
    expect(VIEWS).toHaveProperty("unconfigured");
    expect(VIEWS).toHaveProperty("healthy");
    expect(VIEWS).toHaveProperty("unhealthy");
  });

  it("checking returns non-empty string", () => {
    expect(VIEWS.checking().length).toBeGreaterThan(0);
  });

  it("unconfigured returns non-empty string", () => {
    expect(VIEWS.unconfigured().length).toBeGreaterThan(0);
  });

  it("healthy returns non-empty string", () => {
    expect(VIEWS.healthy().length).toBeGreaterThan(0);
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
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.setItem(STORAGE_KEY_ENDPOINT, "http://127.0.0.1:1234");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 }))
    );

    const state = await resolveEngineState();
    expect(state).toBe("healthy");
    expect(fetch).toHaveBeenCalledWith("http://127.0.0.1:1234/api/v1/health");
  });

  it("returns 'unhealthy' when configured but health check fails", async () => {
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.setItem(STORAGE_KEY_ENDPOINT, "http://127.0.0.1:1234");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network error"))
    );

    const state = await resolveEngineState();
    expect(state).toBe("unhealthy");
  });

  it("returns 'unhealthy' when configured but fetch returns not ok", async () => {
    localStorage.setItem(STORAGE_KEY_CONFIGURED, "true");
    localStorage.setItem(STORAGE_KEY_ENDPOINT, "http://127.0.0.1:1234");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Service Unavailable", { status: 503 }))
    );

    const state = await resolveEngineState();
    expect(state).toBe("unhealthy");
  });
});

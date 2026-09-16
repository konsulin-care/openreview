/**
 * Typed client for communicating with the Go review engine.
 */

// --- Types ---

/** Engine status response from GET /api/v1/status. */
export interface EngineStatus {
  /** Current engine state. */
  state: "NEW" | "READY";
  /** Engine version string. */
  version: string;
}

/** Health check response from GET /api/v1/health. */
export interface HealthStatus {
  /** Always "ok" when healthy. */
  status: "ok";
}

/** Configuration for EngineClient. */
export interface EngineClientConfig {
  /** Function that returns the current endpoint URL (evaluated per request). */
  getEndpoint: () => string;
}

// --- Client ---

/**
 * Typed HTTP client for the review engine API.
 *
 * Uses a getter function for the endpoint to support dynamic reconfiguration
 * (e.g., when the user changes settings).
 */
export class EngineClient {
  private config: EngineClientConfig;

  constructor(config: EngineClientConfig) {
    this.config = config;
  }

  /** Returns the current endpoint URL by calling the config getter. */
  private get endpoint(): string {
    return this.config.getEndpoint();
  }

  /**
   * Fetch engine status (state + version).
   * @returns Parsed EngineStatus
   * @throws On network error or non-OK response
   */
  async getStatus(): Promise<EngineStatus> {
    const response = await fetch(`${this.endpoint}/api/v1/status`);

    if (!response.ok) {
      throw new Error(`Engine status request failed: ${response.status}`);
    }

    return response.json() as Promise<EngineStatus>;
  }

  /**
   * Check engine health.
   * @returns Parsed HealthStatus
   * @throws On network error or non-OK response
   */
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.endpoint}/api/v1/health`);

    if (!response.ok) {
      throw new Error(`Engine health check failed: ${response.status}`);
    }

    return response.json() as Promise<HealthStatus>;
  }
}

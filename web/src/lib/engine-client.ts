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

/** Project returned by the engine API. */
export interface Project {
  id: string;
  path: string;
  name: string;
  created_at: string;
}

/** Response from POST /api/v1/project. */
export interface CreateProjectResponse {
  project_id: string;
  name: string;
  path: string;
  created_at: string;
}

/** Response from GET /api/v1/config. */
export interface EngineConfig {
  project_dir: string;
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

  /**
   * List all registered projects.
   * @returns Array of Project objects
   * @throws On network error or non-OK response
   */
  async listProjects(): Promise<Project[]> {
    const response = await fetch(`${this.endpoint}/api/v1/project`);

    if (!response.ok) {
      throw new Error(`Failed to list projects: ${response.status}`);
    }

    return response.json() as Promise<Project[]>;
  }

  /**
   * Create a new project.
   * @param name — project name
   * @returns Created project details
   * @throws On network error or non-OK response
   */
  async createProject(name: string): Promise<CreateProjectResponse> {
    const response = await fetch(`${this.endpoint}/api/v1/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.status}`);
    }

    return response.json() as Promise<CreateProjectResponse>;
  }

  /**
   * Fetch engine configuration (e.g., default project directory).
   * @returns Parsed EngineConfig
   * @throws On network error or non-OK response
   */
  async getConfig(): Promise<EngineConfig> {
    const response = await fetch(`${this.endpoint}/api/v1/config`);

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }

    return response.json() as Promise<EngineConfig>;
  }

  /**
   * Delete a project by ID. Removes from registry and deletes directory from disk.
   * @param id — project ID (ULID)
   * @returns Deleted project details
   * @throws On network error or non-OK response
   */
  async deleteProject(id: string): Promise<{ project_id: string; name: string }> {
    const response = await fetch(`${this.endpoint}/api/v1/project/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.status}`);
    }

    return response.json() as Promise<{ project_id: string; name: string }>;
  }
}

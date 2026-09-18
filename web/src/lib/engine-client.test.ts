import { describe, it, expect, vi, beforeEach } from "vitest";
import { EngineClient } from "./engine-client";
import type { EngineStatus, HealthStatus, Project, EngineConfig } from "./engine-client";

describe("EngineClient", () => {
  const mockEndpoint = "http://localhost:9999";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getStatus", () => {
    it("returns parsed EngineStatus on 200 OK", async () => {
      const mockStatus: EngineStatus = { state: "READY", version: "1.0.0" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockStatus), { status: 200 })
      );

      const client = new EngineClient({
        getEndpoint: () => mockEndpoint,
      });

      const result = await client.getStatus();

      expect(result).toEqual(mockStatus);
      expect(fetch).toHaveBeenCalledWith(`${mockEndpoint}/api/v1/status`);
    });

    it("throws on network error", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("Network failure")
      );

      const client = new EngineClient({
        getEndpoint: () => mockEndpoint,
      });

      await expect(client.getStatus()).rejects.toThrow("Network failure");
    });

    it("throws on non-OK status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Not Found", { status: 404, statusText: "Not Found" })
      );

      const client = new EngineClient({
        getEndpoint: () => mockEndpoint,
      });

      await expect(client.getStatus()).rejects.toThrow("404");
    });
  });

  describe("getHealth", () => {
    it("returns parsed HealthStatus on 200 OK", async () => {
      const mockHealth: HealthStatus = { status: "ok" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockHealth), { status: 200 })
      );

      const client = new EngineClient({
        getEndpoint: () => mockEndpoint,
      });

      const result = await client.getHealth();

      expect(result).toEqual(mockHealth);
      expect(fetch).toHaveBeenCalledWith(`${mockEndpoint}/api/v1/health`);
    });

    it("throws on network error", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
        new Error("Connection refused")
      );

      const client = new EngineClient({
        getEndpoint: () => mockEndpoint,
      });

      await expect(client.getHealth()).rejects.toThrow("Connection refused");
    });

    it("throws on non-OK status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Server Error", { status: 500, statusText: "Server Error" })
      );

      const client = new EngineClient({
        getEndpoint: () => mockEndpoint,
      });

      await expect(client.getHealth()).rejects.toThrow("500");
    });
  });

  describe("endpoint getter", () => {
    it("calls getEndpoint dynamically on each request", async () => {
      let callCount = 0;
      vi.spyOn(globalThis, "fetch").mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ status: "ok" }), { status: 200 }))
      );

      const client = new EngineClient({
        getEndpoint: () => {
          callCount++;
          return `http://dynamic-${callCount}:1234`;
        },
      });

      await client.getHealth();
      await client.getHealth();

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(
        1,
        "http://dynamic-1:1234/api/v1/health"
      );
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        "http://dynamic-2:1234/api/v1/health"
      );
    });
  });

  describe("listProjects", () => {
    it("returns parsed Project array on 200 OK", async () => {
      const mockProjects: Project[] = [
        { id: "01ABC", path: "./01ABC", name: "Review A", created_at: "2026-01-01T00:00:00Z" },
        { id: "01DEF", path: "./01DEF", name: "Review B", created_at: "2026-01-02T00:00:00Z" },
      ];
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockProjects), { status: 200 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      const result = await client.listProjects();

      expect(result).toEqual(mockProjects);
      expect(fetch).toHaveBeenCalledWith(`${mockEndpoint}/api/v1/project`);
    });

    it("returns empty array when no projects exist", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      const result = await client.listProjects();

      expect(result).toEqual([]);
    });

    it("throws on network error", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network failure"));

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      await expect(client.listProjects()).rejects.toThrow("Network failure");
    });

    it("throws on non-OK status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Server Error", { status: 500 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      await expect(client.listProjects()).rejects.toThrow("500");
    });
  });

  describe("createProject", () => {
    it("returns created project on 200 OK", async () => {
      const mockResponse = {
        project_id: "01XYZ",
        name: "New Review",
        path: "./01XYZ",
        created_at: "2026-01-01T00:00:00Z",
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      const result = await client.createProject({ name: "New Review" });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(`${mockEndpoint}/api/v1/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Review" }),
      });
    });

    it("sends path and description when provided", async () => {
      const mockResponse = {
        project_id: "01XYZ",
        name: "Custom Project",
        path: "/custom/path",
        created_at: "2026-01-01T00:00:00Z",
      };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 200 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      const result = await client.createProject({
        name: "Custom Project",
        path: "/custom/path",
        description: "A custom project",
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(`${mockEndpoint}/api/v1/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Custom Project",
          path: "/custom/path",
          description: "A custom project",
        }),
      });
    });

    it("throws on network error", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Connection refused"));

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      await expect(client.createProject({ name: "Test" })).rejects.toThrow("Connection refused");
    });

    it("throws on non-OK status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Bad Request", { status: 400 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      await expect(client.createProject({ name: "Test" })).rejects.toThrow("400");
    });
  });

  describe("getConfig", () => {
    it("returns parsed EngineConfig on 200 OK", async () => {
      const mockConfig: EngineConfig = { project_dir: "/home/user/.local/share/openreview/projects" };
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response(JSON.stringify(mockConfig), { status: 200 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      const result = await client.getConfig();

      expect(result).toEqual(mockConfig);
      expect(fetch).toHaveBeenCalledWith(`${mockEndpoint}/api/v1/config`);
    });

    it("throws on network error", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network failure"));

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      await expect(client.getConfig()).rejects.toThrow("Network failure");
    });

    it("throws on non-OK status", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
        new Response("Server Error", { status: 500 })
      );

      const client = new EngineClient({ getEndpoint: () => mockEndpoint });
      await expect(client.getConfig()).rejects.toThrow("500");
    });
  });
});

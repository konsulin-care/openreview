// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initDashboard } from "./dashboard";
import type { Project } from "./engine-client";

// Mock engine-client
const mockProjects: Project[] = [
  { id: "01ABC", path: "./01ABC", name: "Review A", created_at: "2026-01-01T00:00:00Z" },
];

const mockListProjects = vi.fn().mockResolvedValue(mockProjects);
const mockCreateProject = vi.fn().mockResolvedValue({
  project_id: "01NEW",
  name: "New Review",
  path: "./01NEW",
  created_at: "2026-01-02T00:00:00Z",
});

vi.mock("./engine-client", () => {
  return {
    EngineClient: class {
      listProjects = mockListProjects;
      createProject = mockCreateProject;
    },
  };
});

vi.mock("./engine-state", () => ({
  getConfiguredEndpoint: vi.fn().mockReturnValue("http://localhost:9999"),
}));

function createDashboardDom(): void {
  document.body.innerHTML = `
    <div id="project-grid"></div>
    <div id="empty-state" class="hidden"></div>
    <button id="new-project-btn"></button>
    <div id="create-modal" class="hidden">
      <div id="modal-backdrop"></div>
      <input id="project-name" type="text" />
      <button id="modal-cancel"></button>
      <button id="modal-create"></button>
      <div id="modal-error" class="hidden"></div>
    </div>
  `;
}

describe("initDashboard", () => {
  beforeEach(() => {
    createDashboardDom();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("renders project cards when projects exist", async () => {
    await initDashboard();

    const grid = document.getElementById("project-grid");
    const emptyState = document.getElementById("empty-state");

    expect(grid?.innerHTML).toContain("Review A");
    expect(grid?.innerHTML).toContain('/project?id=01ABC');
    expect(emptyState?.classList.contains("hidden")).toBe(true);
  });

  it("shows empty state when no projects exist", async () => {
    mockListProjects.mockResolvedValueOnce([]);

    await initDashboard();

    const grid = document.getElementById("project-grid");
    const emptyState = document.getElementById("empty-state");

    expect(grid?.innerHTML).toBe("");
    expect(emptyState?.classList.contains("hidden")).toBe(false);
  });

  it("opens modal when new-project-btn is clicked", async () => {
    await initDashboard();

    const btn = document.getElementById("new-project-btn")!;
    const modal = document.getElementById("create-modal")!;

    expect(modal.classList.contains("hidden")).toBe(true);

    btn.click();

    expect(modal.classList.contains("hidden")).toBe(false);
  });

  it("opens modal when empty-state CTA is clicked", async () => {
    mockListProjects.mockResolvedValueOnce([]);

    await initDashboard();

    const cta = document.getElementById("empty-state-cta")!;
    const modal = document.getElementById("create-modal")!;

    expect(modal.classList.contains("hidden")).toBe(true);

    cta.click();

    expect(modal.classList.contains("hidden")).toBe(false);
  });

  it("closes modal when cancel is clicked", async () => {
    await initDashboard();

    const btn = document.getElementById("new-project-btn")!;
    const modal = document.getElementById("create-modal")!;
    const cancel = document.getElementById("modal-cancel")!;

    btn.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    cancel.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  it("closes modal when backdrop is clicked", async () => {
    await initDashboard();

    const btn = document.getElementById("new-project-btn")!;
    const modal = document.getElementById("create-modal")!;
    const backdrop = document.getElementById("modal-backdrop")!;

    btn.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    backdrop.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });
});

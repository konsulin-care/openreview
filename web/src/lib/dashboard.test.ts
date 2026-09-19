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
const mockUpdateProject = vi.fn().mockResolvedValue({
  project_id: "01NEW",
  name: "New Review",
  path: "./01NEW",
  status: "active",
  created_at: "2026-01-02T00:00:00Z",
});
const mockDeleteProject = vi.fn().mockResolvedValue({
  project_id: "01NEW",
  name: "New Review",
});
const mockGetConfig = vi.fn().mockResolvedValue({
  project_dir: "/home/user/.local/share/openreview/projects",
});

vi.mock("./engine-client", () => {
  return {
    EngineClient: class {
      listProjects = mockListProjects;
      createProject = mockCreateProject;
      updateProject = mockUpdateProject;
      deleteProject = mockDeleteProject;
      getConfig = mockGetConfig;
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
    <button id="action-btn" type="button" class="hidden min-w-[140px] rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">+ New Project</button>
    <button id="clear-selection-btn" type="button" class="hidden min-w-[140px] rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Clear</button>
    <div id="select-all-bar" class="hidden">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" id="select-all-checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span class="text-sm font-medium text-blue-900">Select All (<span id="select-count">0</span>/<span id="total-count">0</span>)</span>
      </label>
    </div>
    <div id="create-modal" class="hidden">
      <div id="modal-backdrop"></div>
      <input id="project-name" type="text" />
      <input id="project-directory" type="text" />
      <textarea id="project-description"></textarea>
      <button id="modal-cancel"></button>
      <button id="modal-create"></button>
      <div id="modal-error" class="hidden"></div>
    </div>
    <div id="delete-confirm-modal" class="hidden">
      <div id="delete-modal-backdrop"></div>
      <p id="delete-confirm-text"></p>
      <div id="delete-confirm-error" class="hidden"></div>
      <button id="delete-confirm-cancel"></button>
      <button id="delete-confirm-submit"></button>
    </div>
  `;
}

describe("initDashboard", () => {
  beforeEach(() => {
    createDashboardDom();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockListProjects.mockReset();
    mockListProjects.mockResolvedValue(mockProjects);
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
    mockListProjects.mockReset();
    mockListProjects.mockResolvedValue([]);

    await initDashboard();

    const grid = document.getElementById("project-grid");
    const emptyState = document.getElementById("empty-state");

    expect(grid?.innerHTML).toBe("");
    expect(emptyState?.classList.contains("hidden")).toBe(false);
  });

  it("hides action-btn when no projects exist", async () => {
    mockListProjects.mockReset();
    mockListProjects.mockResolvedValue([]);

    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    expect(btn.classList.contains("hidden")).toBe(true);
  });

  it("shows action-btn when projects exist", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    expect(btn.classList.contains("hidden")).toBe(false);
  });

  it("fetches projects exactly once when list is empty", async () => {
    mockListProjects.mockReset();
    mockListProjects.mockResolvedValue([]);

    await initDashboard();

    expect(mockListProjects).toHaveBeenCalledTimes(1);
  });

  it("opens modal when action-btn is clicked with no selection", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const modal = document.getElementById("create-modal")!;

    expect(modal.classList.contains("hidden")).toBe(true);
    expect(btn.textContent).toContain("+ New Project");

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

    const btn = document.getElementById("action-btn")!;
    const modal = document.getElementById("create-modal")!;
    const cancel = document.getElementById("modal-cancel")!;

    btn.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    cancel.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  it("closes modal when backdrop is clicked", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const modal = document.getElementById("create-modal")!;
    const backdrop = document.getElementById("modal-backdrop")!;

    btn.click();
    expect(modal.classList.contains("hidden")).toBe(false);

    backdrop.click();
    expect(modal.classList.contains("hidden")).toBe(true);
  });

  it("action-btn shows + New Project by default with blue styling", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    expect(btn.textContent).toContain("+ New Project");
    expect(btn.classList.contains("bg-blue-600")).toBe(true);
  });

  it("action-btn transforms to Delete with red styling when card is selected", async () => {
    await initDashboard();

    const checkbox = document.querySelector("[data-select-project='01ABC']") as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    const btn = document.getElementById("action-btn")!;
    expect(btn.textContent).toContain("Delete");
    expect(btn.classList.contains("bg-red-600")).toBe(true);
  });

  it("clear-selection-btn appears when card is selected", async () => {
    await initDashboard();

    const clearBtn = document.getElementById("clear-selection-btn")!;
    expect(clearBtn.classList.contains("hidden")).toBe(true);

    const checkbox = document.querySelector("[data-select-project='01ABC']") as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(clearBtn.classList.contains("hidden")).toBe(false);
  });

  it("select-all-bar appears when card is selected with correct counts", async () => {
    await initDashboard();

    const selectAllBar = document.getElementById("select-all-bar")!;
    expect(selectAllBar.classList.contains("hidden")).toBe(true);

    const checkbox = document.querySelector("[data-select-project='01ABC']") as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(selectAllBar.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("select-count")!.textContent).toBe("1");
    expect(document.getElementById("total-count")!.textContent).toBe("1");
  });

  it("select-all checkbox selects all cards when checked", async () => {
    await initDashboard();

    const selectAllCheckbox = document.getElementById("select-all-checkbox") as HTMLInputElement;
    selectAllCheckbox.checked = true;
    selectAllCheckbox.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for async refresh
    await new Promise(resolve => setTimeout(resolve, 10));

    const cardCheckbox = document.querySelector("[data-select-project='01ABC']") as HTMLInputElement;
    expect(cardCheckbox.checked).toBe(true);
  });

  it("clear-selection-btn resets checkbox and reverts action-btn", async () => {
    await initDashboard();

    // Select a card
    let checkbox = document.querySelector("[data-select-project='01ABC']") as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for async refresh
    await new Promise(resolve => setTimeout(resolve, 10));

    const btn = document.getElementById("action-btn")!;
    expect(btn.textContent).toContain("Delete");

    // Click clear
    document.getElementById("clear-selection-btn")!.click();

    // Wait for async refresh
    await new Promise(resolve => setTimeout(resolve, 10));

    // Re-query checkbox after DOM update
    checkbox = document.querySelector("[data-select-project='01ABC']") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    expect(btn.textContent).toContain("+ New Project");
    expect(btn.classList.contains("bg-blue-600")).toBe(true);
  });

  it("creates draft on modal open", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const dirInput = document.getElementById("project-directory") as HTMLInputElement;

    await btn.click();

    // Wait for async draft creation
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockCreateProject).toHaveBeenCalledWith({ status: "draft" });
    expect(dirInput.value).toBe("./01NEW");
  });

  it("clears directory input on modal open", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const dirInput = document.getElementById("project-directory") as HTMLInputElement;

    await btn.click();

    // Wait for async draft creation
    await new Promise(resolve => setTimeout(resolve, 10));

    // Directory should be filled with draft path, not config path
    expect(dirInput.value).toBe("./01NEW");
  });

  it("finalizes draft on create click", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const nameInput = document.getElementById("project-name") as HTMLInputElement;
    const createBtn = document.getElementById("modal-create")!;

    await btn.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    nameInput.value = "My Project";
    await createBtn.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockUpdateProject).toHaveBeenCalledWith("01NEW", {
      name: "My Project",
      path: "./01NEW",
      description: undefined,
      status: "active",
    });
  });

  it("deletes draft on cancel click", async () => {
    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const cancelBtn = document.getElementById("modal-cancel")!;

    await btn.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    await cancelBtn.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(mockDeleteProject).toHaveBeenCalledWith("01NEW");
  });

  it("handles draft creation failure gracefully", async () => {
    mockCreateProject.mockRejectedValueOnce(new Error("network error"));

    await initDashboard();

    const btn = document.getElementById("action-btn")!;
    const modalError = document.getElementById("modal-error")!;

    await btn.click();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(modalError.classList.contains("hidden")).toBe(false);
    expect(modalError.textContent).toContain("Failed to create draft");
  });
});

/**
 * Dashboard initialization and interactivity logic.
 */

import { EngineClient, type Project } from "./engine-client";
import { getConfiguredEndpoint } from "./engine-state";
import { renderProjectCards, renderEmptyState } from "../components/review/projectcard-list";

/**
 * Convert a string to a URL-safe slug.
 * @param name — raw input string
 * @returns lowercase, hyphen-separated slug with no leading/trailing hyphens
 */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Initialize the dashboard: fetch projects, render list, wire modal interactions.
 * Call this after VIEWS["healthy"]() has rendered the HTML shell.
 */
export async function initDashboard(): Promise<void> {
  const client = new EngineClient({ getEndpoint: getConfiguredEndpoint });

  // --- Fetch default project directory ---
  let defaultProjectDir = "";
  try {
    const config = await client.getConfig();
    defaultProjectDir = config.project_dir;
  } catch (err) {
    console.error("[dashboard] failed to fetch config:", err);
  }

  // --- DOM elements ---
  const grid = document.getElementById("project-grid");
  const emptyState = document.getElementById("empty-state");
  const modal = document.getElementById("create-modal");
  const actionBtn = document.getElementById("action-btn");
  const clearSelectionBtn = document.getElementById("clear-selection-btn");
  const selectAllBar = document.getElementById("select-all-bar");
  const selectAllCheckbox = document.getElementById("select-all-checkbox") as HTMLInputElement | null;
  const selectCount = document.getElementById("select-count");
  const totalCount = document.getElementById("total-count");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCancel = document.getElementById("modal-cancel");
  const modalCreate = document.getElementById("modal-create");
  const modalError = document.getElementById("modal-error");
  const nameInput = document.getElementById("project-name") as HTMLInputElement | null;
  const dirInput = document.getElementById("project-directory") as HTMLInputElement | null;
  const descInput = document.getElementById("project-description") as HTMLTextAreaElement | null;
  const deleteConfirmModal = document.getElementById("delete-confirm-modal");
  const deleteModalBackdrop = document.getElementById("delete-modal-backdrop");
  const deleteConfirmCancel = document.getElementById("delete-confirm-cancel");
  const deleteConfirmSubmit = document.getElementById("delete-confirm-submit");
  const deleteConfirmText = document.getElementById("delete-confirm-text");
  const deleteConfirmError = document.getElementById("delete-confirm-error");

  if (!grid || !emptyState || !modal || !actionBtn || !nameInput) return;

  // Narrow types for nested closures
  const gridEl = grid;
  const emptyStateEl = emptyState;
  const modalEl = modal;
  const nameInputEl = nameInput;
  const dirInputEl = dirInput;
  const actionBtnEl = actionBtn;
  const clearSelectionBtnEl = clearSelectionBtn;
  const selectAllBarEl = selectAllBar;
  const selectAllCheckboxEl = selectAllCheckbox;

  // --- Selection state ---
  const selectedIds = new Set<string>();
  let projects: Project[] = [];
  let refreshing = false;

  /** Open the create-project modal. */
  function openModal(): void {
    modalEl.classList.remove("hidden");
    nameInputEl.value = "";
    if (dirInputEl) {
      dirInputEl.value = defaultProjectDir;
    }
    const hint = document.getElementById("default-dir-hint");
    if (hint && defaultProjectDir) {
      hint.textContent = `(${defaultProjectDir})`;
    }
    if (modalError) modalError.classList.add("hidden");
    nameInputEl.focus();
  }

  /** Close the create-project modal. */
  function closeModal(): void {
    modalEl.classList.add("hidden");
  }

  /** Open the delete confirmation modal. */
  function openDeleteModal(): void {
    const names = projects
      .filter((p) => selectedIds.has(p.id))
      .map((p) => `"${p.name}"`)
      .join(", ");
    if (deleteConfirmText) {
      deleteConfirmText.textContent = `This will permanently remove ${names} from disk. This cannot be undone.`;
    }
    deleteConfirmModal?.classList.remove("hidden");
    deleteConfirmError?.classList.add("hidden");
  }

  /** Update selection UI: button transformation, counts, visibility. */
  function updateSelectionUI(): void {
    const count = selectedIds.size;

    if (count === 0) {
      // Default state: "+ New Project" button (blue)
      actionBtnEl.textContent = "+ New Project";
      // Hide button when no projects, show when projects exist
      actionBtnEl.className = projects.length === 0
        ? "hidden min-w-[140px] rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        : "min-w-[140px] rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700";
      actionBtnEl.onclick = () => openModal();

      // Hide clear button and select-all bar
      clearSelectionBtnEl?.classList.add("hidden");
      selectAllBarEl?.classList.add("hidden");

      // Reset select-all checkbox
      if (selectAllCheckboxEl) selectAllCheckboxEl.checked = false;
    } else {
      // Selection state: "Delete" button (red)
      actionBtnEl.textContent = "Delete";
      actionBtnEl.className = "min-w-[140px] rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700";
      actionBtnEl.onclick = () => openDeleteModal();

      // Show clear button and select-all bar
      clearSelectionBtnEl?.classList.remove("hidden");
      selectAllBarEl?.classList.remove("hidden");

      // Update counts
      if (selectCount) selectCount.textContent = String(count);
      if (totalCount) totalCount.textContent = String(projects.length);

      // Update select-all checkbox state
      if (selectAllCheckboxEl) {
        selectAllCheckboxEl.checked = count === projects.length;
      }
    }
  }

  /** Clear all selections and refresh UI. */
  function clearSelection(): void {
    selectedIds.clear();
    updateSelectionUI();
    refreshProjects();
  }

  /** Refresh the project list from the engine. */
  async function refreshProjects(): Promise<void> {
    if (refreshing) return;
    refreshing = true;
    try {
      projects = await client.listProjects();

      if (projects.length > 0) {
        gridEl.innerHTML = renderProjectCards(projects, selectedIds);
        emptyStateEl.classList.add("hidden");
      } else {
        gridEl.innerHTML = "";
        emptyStateEl.innerHTML = renderEmptyState();
        emptyStateEl.classList.remove("hidden");
        clearSelection();
      }
    } catch (err) {
      console.error("[dashboard] failed to load projects:", err);
    } finally {
      refreshing = false;
    }
  }

  // Load projects on init
  await refreshProjects();

  // Show/hide action-btn based on project count
  if (projects.length > 0) {
    actionBtnEl.classList.remove("hidden");
  }

  // Set initial button state
  actionBtnEl.onclick = () => openModal();

  // Wire empty-state CTA (delegated in case innerHTML is replaced)
  emptyState.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "empty-state-cta") {
      openModal();
    }
  });

  // Wire modal close
  modalCancel?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);

  // Wire name input to auto-generate directory path
  nameInputEl.addEventListener("input", () => {
    if (!dirInputEl) return;
    const name = nameInputEl.value.trim();
    if (name && defaultProjectDir) {
      dirInputEl.value = `${defaultProjectDir}/${slugify(name)}`;
    } else if (defaultProjectDir) {
      dirInputEl.value = defaultProjectDir;
    }
  });

  // Wire modal create
  modalCreate?.addEventListener("click", async () => {
    const name = nameInputEl.value.trim();
    if (!name) {
      if (modalError) {
        modalError.textContent = "Project name is required.";
        modalError.classList.remove("hidden");
      }
      return;
    }

    const path = dirInput?.value.trim() || undefined;
    const description = descInput?.value.trim() || undefined;

    try {
      await client.createProject({ name, path, description });
      closeModal();
      await refreshProjects();
    } catch (err) {
      console.error("[dashboard] failed to create project:", err);
      if (modalError) {
        modalError.textContent = "Failed to create project. Please try again.";
        modalError.classList.remove("hidden");
      }
    }
  });

  // --- Multi-select wiring ---

  // Show checkbox on card hover, hide when mouse leaves (event delegation)
  gridEl.addEventListener("mouseover", (e) => {
    const card = (e.target as HTMLElement).closest("[data-project-id]");
    if (!card) return;
    const label = card.querySelector("label");
    if (label) label.style.opacity = "1";
  });
  gridEl.addEventListener("mouseout", (e) => {
    const card = (e.target as HTMLElement).closest("[data-project-id]");
    if (!card) return;
    const checkbox = card.querySelector("input[type=checkbox]") as HTMLInputElement | null;
    if (checkbox?.checked) return; // keep visible if selected
    const label = card.querySelector("label");
    if (label) label.style.opacity = "";
  });

  // Wire checkbox clicks (event delegation on grid)
  gridEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.dataset.selectProject) return;
    const id = target.dataset.selectProject;
    if (target.checked) {
      selectedIds.add(id);
    } else {
      selectedIds.delete(id);
    }
    updateSelectionUI();
    await refreshProjects();
  });

  // Wire clear selection
  clearSelectionBtnEl?.addEventListener("click", clearSelection);

  // Wire select-all checkbox
  selectAllCheckboxEl?.addEventListener("change", async () => {
    if (selectAllCheckboxEl.checked) {
      // Select all projects
      for (const p of projects) {
        selectedIds.add(p.id);
      }
    } else {
      // Deselect all
      selectedIds.clear();
    }
    updateSelectionUI();
    await refreshProjects();
  });

  // Wire confirmation modal cancel
  deleteConfirmCancel?.addEventListener("click", () => {
    deleteConfirmModal?.classList.add("hidden");
  });
  deleteModalBackdrop?.addEventListener("click", () => {
    deleteConfirmModal?.classList.add("hidden");
  });

  // Wire confirmation modal submit
  deleteConfirmSubmit?.addEventListener("click", async () => {
    const ids = Array.from(selectedIds);
    try {
      for (const id of ids) {
        await client.deleteProject(id);
      }
      clearSelection();
      deleteConfirmModal?.classList.add("hidden");
      await refreshProjects();
    } catch (err) {
      console.error("[dashboard] failed to delete projects:", err);
      if (deleteConfirmError) {
        deleteConfirmError.textContent = "Failed to delete one or more projects. Please try again.";
        deleteConfirmError.classList.remove("hidden");
      }
    }
  });
}

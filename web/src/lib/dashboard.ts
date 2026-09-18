/**
 * Dashboard initialization and interactivity logic.
 */

import { EngineClient, type Project } from "./engine-client";
import { getConfiguredEndpoint } from "./engine-state";
import { renderProjectCards, renderEmptyState } from "../components/review/projectcard-list";

/**
 * Initialize the dashboard: fetch projects, render list, wire modal interactions.
 * Call this after VIEWS["healthy"]() has rendered the HTML shell.
 */
export async function initDashboard(): Promise<void> {
  const client = new EngineClient({ getEndpoint: getConfiguredEndpoint });

  // --- DOM elements ---
  const grid = document.getElementById("project-grid");
  const emptyState = document.getElementById("empty-state");
  const modal = document.getElementById("create-modal");
  const newProjectBtn = document.getElementById("new-project-btn");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCancel = document.getElementById("modal-cancel");
  const modalCreate = document.getElementById("modal-create");
  const modalError = document.getElementById("modal-error");
  const nameInput = document.getElementById("project-name") as HTMLInputElement | null;

  // Selection elements
  const selectionBar = document.getElementById("selection-bar");
  const selectionCount = document.getElementById("selection-count");
  const deleteCount = document.getElementById("delete-count");
  const clearSelectionBtn = document.getElementById("clear-selection");
  const deleteSelectedBtn = document.getElementById("delete-selected");
  const deleteConfirmModal = document.getElementById("delete-confirm-modal");
  const deleteModalBackdrop = document.getElementById("delete-modal-backdrop");
  const deleteConfirmCancel = document.getElementById("delete-confirm-cancel");
  const deleteConfirmSubmit = document.getElementById("delete-confirm-submit");
  const deleteConfirmText = document.getElementById("delete-confirm-text");
  const deleteConfirmError = document.getElementById("delete-confirm-error");

  if (!grid || !emptyState || !modal || !newProjectBtn || !nameInput) return;

  // Narrow types for nested closures
  const gridEl = grid;
  const emptyStateEl = emptyState;
  const modalEl = modal;
  const nameInputEl = nameInput;

  // --- Selection state ---
  const selectedIds = new Set<string>();
  let projects: Project[] = [];

  /** Open the create-project modal. */
  function openModal(): void {
    modalEl.classList.remove("hidden");
    nameInputEl.value = "";
    if (modalError) modalError.classList.add("hidden");
    nameInputEl.focus();
  }

  /** Close the create-project modal. */
  function closeModal(): void {
    modalEl.classList.add("hidden");
  }

  /** Update selection bar visibility and counts. */
  function updateSelectionUI(): void {
    const count = selectedIds.size;
    if (count === 0) {
      selectionBar?.classList.add("hidden");
    } else {
      selectionBar?.classList.remove("hidden");
      if (selectionCount) selectionCount.textContent = `${count} selected`;
      if (deleteCount) deleteCount.textContent = String(count);
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
    }
  }

  // Load projects on init
  await refreshProjects();

  // Wire new-project buttons
  newProjectBtn.addEventListener("click", openModal);

  // Wire empty-state CTA (delegated in case innerHTML is replaced)
  emptyState.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "empty-state-cta") {
      openModal();
    }
  });

  // Wire modal close
  modalCancel?.addEventListener("click", closeModal);
  modalBackdrop?.addEventListener("click", closeModal);

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

    try {
      await client.createProject(name);
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
  gridEl.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.dataset.selectProject) return;
    const id = target.dataset.selectProject;
    if (target.checked) {
      selectedIds.add(id);
    } else {
      selectedIds.delete(id);
    }
    updateSelectionUI();
    refreshProjects();
  });

  // Wire clear selection
  clearSelectionBtn?.addEventListener("click", clearSelection);

  // Wire delete button → open confirmation
  deleteSelectedBtn?.addEventListener("click", () => {
    const names = projects
      .filter((p) => selectedIds.has(p.id))
      .map((p) => `"${p.name}"`)
      .join(", ");
    if (deleteConfirmText) {
      deleteConfirmText.textContent = `This will permanently remove ${names} from disk. This cannot be undone.`;
    }
    deleteConfirmModal?.classList.remove("hidden");
    deleteConfirmError?.classList.add("hidden");
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

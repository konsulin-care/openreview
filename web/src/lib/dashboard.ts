/**
 * Dashboard initialization and interactivity logic.
 */

import { EngineClient } from "./engine-client";
import { getConfiguredEndpoint } from "./engine-state";
import { renderProjectCards, renderEmptyState } from "../components/review/projectcard-list";

/**
 * Initialize the dashboard: fetch projects, render list, wire modal interactions.
 * Call this after VIEWS["healthy"]() has rendered the HTML shell.
 */
export async function initDashboard(): Promise<void> {
  const client = new EngineClient({ getEndpoint: getConfiguredEndpoint });

  const grid = document.getElementById("project-grid");
  const emptyState = document.getElementById("empty-state");
  const modal = document.getElementById("create-modal");
  const newProjectBtn = document.getElementById("new-project-btn");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalCancel = document.getElementById("modal-cancel");
  const modalCreate = document.getElementById("modal-create");
  const modalError = document.getElementById("modal-error");
  const nameInput = document.getElementById("project-name") as HTMLInputElement | null;

  if (!grid || !emptyState || !modal || !newProjectBtn || !nameInput) return;

  // Narrow types for nested closures
  const gridEl = grid;
  const emptyStateEl = emptyState;
  const modalEl = modal;
  const nameInputEl = nameInput;

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

  /** Refresh the project list from the engine. */
  async function refreshProjects(): Promise<void> {
    try {
      const projects = await client.listProjects();

      if (projects.length > 0) {
        gridEl.innerHTML = renderProjectCards(projects);
        emptyStateEl.classList.add("hidden");
      } else {
        gridEl.innerHTML = "";
        emptyStateEl.innerHTML = renderEmptyState();
        emptyStateEl.classList.remove("hidden");
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
}

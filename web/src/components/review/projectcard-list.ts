/**
 * ProjectCard list rendering logic, extracted for testability.
 */

import type { Project } from "../../lib/engine-client";

/**
 * Render an array of projects as linked ProjectCard HTML.
 * @param projects — array of Project objects from the engine
 * @returns concatenated HTML string of linked project cards
 */
export function renderProjectCards(projects: Project[]): string {
  if (projects.length === 0) return "";

  return projects
    .map(
      (p) => `
      <a href="/project?id=${p.id}" class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <h3 class="text-lg font-semibold text-gray-900">${escapeHtml(p.name)}</h3>
        <p class="mt-1 text-xs text-gray-500">Created ${escapeHtml(p.created_at)}</p>
      </a>`
    )
    .join("");
}

/**
 * Render the empty state HTML shown when no projects exist.
 * @returns HTML string for the empty state
 */
export function renderEmptyState(): string {
  return `
    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
    <h2 class="mt-4 text-lg font-semibold text-gray-900">No projects yet</h2>
    <p class="mt-1 text-sm text-gray-500">Create your first project to start screening papers.</p>
    <button id="empty-state-cta" type="button" class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Create Project</button>`;
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param str — raw string
 * @returns escaped string safe for HTML interpolation
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * ProjectCard list rendering logic, extracted for testability.
 */

import type { Project } from "../../lib/engine-client";

/**
 * Truncate a file path to show only the last 2 segments with a leading ellipsis.
 * @param path — full file path
 * @returns truncated path with .../ prefix, or full path if ≤2 segments
 */
export function truncatePath(path: string): string {
  if (!path) return "";
  // Strip trailing slashes
  const trimmed = path.replace(/\/+$/, "");
  if (!trimmed) return "/";
  const segments = trimmed.split("/").filter(Boolean);
  if (segments.length <= 2) return trimmed;
  const lastTwo = segments.slice(-2);
  return `.../${lastTwo.join("/")}`;
}

/**
 * Format an ISO date string to the browser's local timezone and locale.
 * @param isoString — ISO 8601 date string
 * @returns locale-aware date+time string
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

/**
 * Render an array of projects as linked ProjectCard HTML.
 * @param projects — array of Project objects from the engine
 * @param selectedIds — set of selected project IDs (for multi-select)
 * @returns concatenated HTML string of linked project cards
 */
export function renderProjectCards(
  projects: Project[],
  selectedIds: Set<string> = new Set()
): string {
  if (projects.length === 0) return "";

  return projects
    .map(
      (p) => {
        const checked = selectedIds.has(p.id) ? "checked" : "";
        const selectedClass = selectedIds.has(p.id)
          ? " ring-2 ring-blue-500 bg-blue-50"
          : "";
        const checkboxVisible = selectedIds.size > 0 ? " !opacity-100" : "";

        // Screening status badge
        const statusBadge = getScreeningBadge(p.screening_status);

        // Truncated path
        const displayPath = truncatePath(p.path);

        // Formatted date+time
        const displayDateTime = formatDateTime(p.created_at);

        return `
      <div data-project-id="${p.id}" class="group relative block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md min-h-[180px]${selectedClass}">
        <label class="absolute left-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer opacity-0 transition-opacity${checkboxVisible}">
          <input type="checkbox" data-select-project="${p.id}" ${checked}
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </label>
        <a href="/project?id=${p.id}" class="block pl-8">
          <h3 class="text-base font-semibold text-gray-900">${escapeHtml(p.name)}</h3>
          <p class="mt-1 text-xs text-gray-500">
            <svg class="inline-block h-3.5 w-3.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${escapeHtml(displayDateTime)}
          </p>
          <p class="mt-1">${statusBadge}</p>
          ${p.description ? `<p class="mt-2 text-sm text-gray-600 line-clamp-3">${escapeHtml(p.description)}</p>` : ""}
          <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              ${p.paper_count}
            </span>
            <span class="inline-flex items-center gap-1 text-green-600">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
              ${p.accepted_count}
            </span>
            <span class="inline-flex items-center gap-1 text-red-600">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
              </svg>
              ${p.rejected_count}
            </span>
            <span class="inline-flex items-center gap-1 text-gray-400">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="4 4"/>
              </svg>
              ${p.no_decision_count}
            </span>
            <span class="inline-flex items-center gap-1 text-amber-500">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              ${p.conflict_count}
            </span>
          </div>
          <p class="mt-3 text-xs text-gray-400 truncate" title="${escapeHtml(p.path)}">
            <svg class="inline-block h-3.5 w-3.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            ${escapeHtml(displayPath)}
          </p>
        </a>
      </div>`;
      }
    )
    .join("");
}

/**
 * Get the screening status badge HTML.
 * @param status — screening status
 * @returns HTML string for the badge
 */
function getScreeningBadge(status: string): string {
  const badges: Record<string, { class: string; text: string }> = {
    "not-started": { class: "bg-gray-100 text-gray-600", text: "Not started" },
    "in-progress": { class: "bg-blue-100 text-blue-700", text: "In progress" },
    complete: { class: "bg-green-100 text-green-700", text: "Complete" },
  };
  const badge = badges[status] || badges["not-started"];
  return `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.class}">${badge.text}</span>`;
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
    <p class="mt-1 text-sm text-gray-500">Start your first systematic review today.</p>
    <button id="empty-state-cta" type="button" class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Start a Project</button>`;
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

/**
 * ProjectCard class mapping logic, extracted for testability.
 */

export type ProjectStatus = "active" | "completed" | "archived";

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-600",
};

const BADGE_BASE = "rounded px-2 py-0.5 text-xs font-medium";

/**
 * Get the classes for a project status badge.
 */
export function getStatusClasses(status: ProjectStatus): string {
  return `${BADGE_BASE} ${STATUS_CLASSES[status]}`;
}

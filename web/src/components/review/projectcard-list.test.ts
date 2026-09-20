import { describe, it, expect } from "vitest";
import { renderProjectCards, renderEmptyState, truncatePath, formatDateTime } from "./projectcard-list";
import type { Project } from "../../lib/engine-client";

/** Helper to create a Project with default values for all required fields. */
function makeProject(overrides: Partial<Project>): Project {
  return {
    id: "",
    path: "",
    name: "",
    description: "",
    created_at: "2026-01-01T00:00:00Z",
    paper_count: 0,
    accepted_count: 0,
    rejected_count: 0,
    no_decision_count: 0,
    conflict_count: 0,
    screening_status: "not-started",
    ...overrides,
  };
}

const mockProjects: Project[] = [
  {
    id: "01ABC",
    path: "/tmp/01ABC",
    name: "Review A",
    description: "A comprehensive review of XYZ",
    created_at: "2026-01-01T00:00:00Z",
    paper_count: 100,
    accepted_count: 50,
    rejected_count: 30,
    no_decision_count: 15,
    conflict_count: 5,
    screening_status: "in-progress",
  },
  {
    id: "01DEF",
    path: "/tmp/01DEF",
    name: "Review B",
    description: "",
    created_at: "2026-01-02T00:00:00Z",
    paper_count: 0,
    accepted_count: 0,
    rejected_count: 0,
    no_decision_count: 0,
    conflict_count: 0,
    screening_status: "not-started",
  },
];

describe("renderProjectCards", () => {
  it("returns empty string for empty array", () => {
    expect(renderProjectCards([])).toBe("");
  });

  it("includes data-project-id on each card", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain('data-project-id="01ABC"');
    expect(html).toContain('data-project-id="01DEF"');
  });

  it("includes checkbox with data-select-project on each card", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain('data-select-project="01ABC"');
    expect(html).toContain('data-select-project="01DEF"');
    expect(html).toContain('type="checkbox"');
  });

  it("does not check checkboxes when selectedIds is empty", () => {
    const html = renderProjectCards(mockProjects, new Set());
    // Find checkbox inputs — they should not have checked attribute
    const checkboxRegex = /<input[^>]*data-select-project[^>]*>/g;
    const matches = html.match(checkboxRegex) || [];
    for (const match of matches) {
      expect(match).not.toContain("checked");
    }
  });

  it("applies selected class when ID is in selectedIds", () => {
    const selected = new Set(["01ABC"]);
    const html = renderProjectCards(mockProjects, selected);
    // The card with 01ABC should have ring-2 ring-blue-500
    const cardRegex = /<div data-project-id="01ABC"[^>]*class="([^"]*)"/;
    const match = html.match(cardRegex);
    expect(match).not.toBeNull();
    expect(match![1]).toContain("ring-2");
    expect(match![1]).toContain("ring-blue-500");
  });

  it("does not apply selected class when ID is not in selectedIds", () => {
    const selected = new Set(["01ABC"]);
    const html = renderProjectCards(mockProjects, selected);
    const cardRegex = /<div data-project-id="01DEF"[^>]*class="([^"]*)"/;
    const match = html.match(cardRegex);
    expect(match).not.toBeNull();
    expect(match![1]).not.toContain("ring-2");
  });

  it("marks selected checkbox as checked", () => {
    const selected = new Set(["01DEF"]);
    const html = renderProjectCards(mockProjects, selected);
    const checkboxRegex = /<input[^>]*data-select-project="01DEF"[^>]*>/;
    const match = html.match(checkboxRegex);
    expect(match).not.toBeNull();
    expect(match![0]).toContain("checked");
  });

  it("makes checkboxes always visible when any selection exists", () => {
    const selected = new Set(["01ABC"]);
    const html = renderProjectCards(mockProjects, selected);
    expect(html).toContain("!opacity-100");
  });

  it("hides checkboxes when no selection exists", () => {
    const html = renderProjectCards(mockProjects, new Set());
    expect(html).toContain("opacity-0");
    expect(html).not.toContain("!opacity-100");
  });

  it("renders a single project card with link", () => {
    const projects: Project[] = [
      makeProject({ id: "01ABC", path: "./01ABC", name: "Review A" }),
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain("Review A");
    expect(html).toContain('href="/project?id=01ABC"');
    expect(html).toContain("01ABC");
  });

  it("renders multiple project cards", () => {
    const projects: Project[] = [
      makeProject({ id: "01ABC", path: "./01ABC", name: "Review A" }),
      makeProject({ id: "01DEF", path: "./01DEF", name: "Review B" }),
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain("Review A");
    expect(html).toContain("Review B");
    expect(html).toContain('href="/project?id=01ABC"');
    expect(html).toContain('href="/project?id=01DEF"');
  });

  it("wraps each card in a link to /project?id=", () => {
    const projects: Project[] = [
      {
        id: "01XYZ",
        path: "./01XYZ",
        name: "Test",
        description: "",
        created_at: "2026-01-01T00:00:00Z",
        paper_count: 0,
        accepted_count: 0,
        rejected_count: 0,
        no_decision_count: 0,
        conflict_count: 0,
        screening_status: "not-started",
      },
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain('<a href="/project?id=01XYZ"');
    expect(html).toContain("</a>");
  });

  it("includes project created_at date", () => {
    const projects: Project[] = [
      {
        id: "01ABC",
        path: "./01ABC",
        name: "Review A",
        description: "",
        created_at: "2026-01-01T00:00:00Z",
        paper_count: 0,
        accepted_count: 0,
        rejected_count: 0,
        no_decision_count: 0,
        conflict_count: 0,
        screening_status: "not-started",
      },
    ];
    const html = renderProjectCards(projects);

    // Date is formatted via toLocaleString(), so just check it's rendered
    expect(html).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
  });

  it("positions checkbox vertically centered on left edge", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain("left-3 top-1/2 -translate-y-1/2");
    expect(html).not.toContain("top-3 left-3");
  });

  it("adds padding-left to card link to avoid overlap with checkbox", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain('class="block pl-8"');
  });

  it("renders description", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain("A comprehensive review of XYZ");
  });

  it("renders truncated path with full path in title attribute", () => {
    const projects: Project[] = [
      {
        id: "01ABC",
        path: "/home/lam/data/professional/jobs/konsulin/reviews/dm2-depression-prevalence",
        name: "Review A",
        description: "",
        created_at: "2026-01-01T00:00:00Z",
        paper_count: 0,
        accepted_count: 0,
        rejected_count: 0,
        no_decision_count: 0,
        conflict_count: 0,
        screening_status: "not-started",
      },
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain(".../reviews/dm2-depression-prevalence");
    expect(html).toContain('title="/home/lam/data/professional/jobs/konsulin/reviews/dm2-depression-prevalence"');
  });

  it("renders paper count stats", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain("100");
    expect(html).toContain("50");
    expect(html).toContain("30");
  });

  it("renders screening status badge", () => {
    const html = renderProjectCards(mockProjects);
    expect(html).toContain("In progress");
  });
});

describe("truncatePath", () => {
  it("truncates long path to last 2 segments", () => {
    expect(truncatePath("/home/lam/data/professional/jobs/konsulin/reviews/dm2-depression-prevalence")).toBe(".../reviews/dm2-depression-prevalence");
  });

  it("returns full path when 2 or fewer segments", () => {
    expect(truncatePath("/reviews/dm2")).toBe("/reviews/dm2");
  });

  it("handles single segment path", () => {
    expect(truncatePath("/reviews")).toBe("/reviews");
  });

  it("handles path without leading slash", () => {
    expect(truncatePath("reviews/dm2")).toBe("reviews/dm2");
  });

  it("handles empty path", () => {
    expect(truncatePath("")).toBe("");
  });

  it("handles path with trailing slash", () => {
    expect(truncatePath("/reviews/dm2/")).toBe("/reviews/dm2");
  });
});

describe("formatDateTime", () => {
  it("returns a non-empty string", () => {
    const result = formatDateTime("2026-01-01T00:00:00Z");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns a string (format varies by locale/timezone)", () => {
    const result = formatDateTime("2026-01-15T15:45:00Z");
    expect(typeof result).toBe("string");
  });
});

describe("renderEmptyState", () => {
  it("returns a non-empty string", () => {
    const html = renderEmptyState();
    expect(html.length).toBeGreaterThan(0);
  });

  it("contains empty state heading", () => {
    const html = renderEmptyState();
    expect(html).toContain("No projects yet");
  });

  it("contains description text", () => {
    const html = renderEmptyState();
    expect(html).toContain("Start your first systematic review today.");
  });

  it("contains CTA button", () => {
    const html = renderEmptyState();
    expect(html).toContain("Start a Project");
  });
});

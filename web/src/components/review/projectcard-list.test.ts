import { describe, it, expect } from "vitest";
import { renderProjectCards, renderEmptyState } from "./projectcard-list";
import type { Project } from "../../lib/engine-client";

const mockProjects: Project[] = [
  { id: "01ABC", path: "/tmp/01ABC", name: "Review A", created_at: "2026-01-01" },
  { id: "01DEF", path: "/tmp/01DEF", name: "Review B", created_at: "2026-01-02" },
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
      { id: "01ABC", path: "./01ABC", name: "Review A", created_at: "2026-01-01T00:00:00Z" },
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain("Review A");
    expect(html).toContain('href="/project?id=01ABC"');
    expect(html).toContain("01ABC");
  });

  it("renders multiple project cards", () => {
    const projects: Project[] = [
      { id: "01ABC", path: "./01ABC", name: "Review A", created_at: "2026-01-01T00:00:00Z" },
      { id: "01DEF", path: "./01DEF", name: "Review B", created_at: "2026-01-02T00:00:00Z" },
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain("Review A");
    expect(html).toContain("Review B");
    expect(html).toContain('href="/project?id=01ABC"');
    expect(html).toContain('href="/project?id=01DEF"');
  });

  it("wraps each card in a link to /project?id=", () => {
    const projects: Project[] = [
      { id: "01XYZ", path: "./01XYZ", name: "Test", created_at: "2026-01-01T00:00:00Z" },
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain('<a href="/project?id=01XYZ"');
    expect(html).toContain("</a>");
  });

  it("includes project created_at date", () => {
    const projects: Project[] = [
      { id: "01ABC", path: "./01ABC", name: "Review A", created_at: "2026-01-01T00:00:00Z" },
    ];
    const html = renderProjectCards(projects);

    expect(html).toContain("2026-01-01");
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

import { describe, it, expect } from "vitest";
import { renderProjectCards, renderEmptyState } from "./projectcard-list";
import type { Project } from "../../lib/engine-client";

describe("renderProjectCards", () => {
  it("returns empty string for empty array", () => {
    expect(renderProjectCards([])).toBe("");
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
    expect(html).toContain("Create your first project");
  });

  it("contains CTA button", () => {
    const html = renderEmptyState();
    expect(html).toContain("Create Project");
  });
});

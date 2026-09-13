import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../dist");

/**
 * Build verification tests for the component showcase page.
 */
describe("Showcase page (build verification)", () => {
  let componentsHtml: string;

  beforeAll(() => {
    componentsHtml = readFileSync(resolve(distDir, "components/index.html"), "utf-8");
  });

  it("renders page title", () => {
    expect(componentsHtml).toContain("Components");
  });

  it("renders breadcrumbs with aria-label", () => {
    expect(componentsHtml).toContain('aria-label="Breadcrumb"');
  });

  it("renders all component entries with status badges", () => {
    expect(componentsHtml).toContain("bg-green-100 text-green-800");
    expect(componentsHtml).toContain("bg-gray-100 text-gray-600");
  });

  it("renders live preview of Button component", () => {
    expect(componentsHtml).toContain("Primary");
    expect(componentsHtml).toContain("Secondary");
    expect(componentsHtml).toContain("Ghost");
  });

  it("renders live preview of Badge component", () => {
    const stableCount = (componentsHtml.match(/bg-green-100 text-green-800/g) || []).length;
    expect(stableCount).toBeGreaterThanOrEqual(1);
  });

  it("renders live preview of Callout component", () => {
    expect(componentsHtml).toContain("border-blue-500");
    expect(componentsHtml).toContain("bg-blue-50");
  });

  it("renders live preview of Breadcrumbs component", () => {
    expect(componentsHtml).toContain('href="/"');
    expect(componentsHtml).toContain("Home");
  });

  it("renders live preview of DocNav component", () => {
    expect(componentsHtml).toContain("&larr;");
    expect(componentsHtml).toContain("&rarr;");
  });

  it("renders live preview of TableOfContents component", () => {
    expect(componentsHtml).toContain('aria-label="Table of contents"');
    expect(componentsHtml).toContain('href="#section-1"');
  });

  it("renders all component categories", () => {
    expect(componentsHtml).toContain("ui");
    expect(componentsHtml).toContain("layout");
    expect(componentsHtml).toContain("docs");
    expect(componentsHtml).toContain("review");
  });
});

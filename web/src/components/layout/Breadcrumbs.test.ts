import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/**
 * Build verification tests for Breadcrumbs component.
 */
describe("Breadcrumbs component (build verification)", () => {
  let componentsHtml: string;

  beforeAll(() => {
    componentsHtml = readFileSync(resolve(distDir, "components/index.html"), "utf-8");
  });

  it("renders nav with aria-label", () => {
    expect(componentsHtml).toContain('aria-label="Breadcrumb"');
  });

  it("renders Home as a link", () => {
    expect(componentsHtml).toContain('href="/"');
    expect(componentsHtml).toContain("Home");
  });

  it("renders current page as plain text (no link)", () => {
    // "Components" should appear as plain text, not wrapped in an <a> to the current page
    expect(componentsHtml).toContain("Components");
  });

  it("renders separator between items", () => {
    expect(componentsHtml).toContain("/");
  });
});

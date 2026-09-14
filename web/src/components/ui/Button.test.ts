import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/**
 * Build verification tests for Button component.
 * Tests the actual HTML output from `astro build`.
 */
describe("Button component (build verification)", () => {
  let componentsHtml: string;

  beforeAll(() => {
    componentsHtml = readFileSync(resolve(distDir, "components/index.html"), "utf-8");
  });

  it("renders ghost-variant button on components page", () => {
    const matches = componentsHtml.match(/text-gray-600 hover:text-gray-900 hover:bg-gray-100/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(1);
  });

  it("applies base button classes (inline-flex, rounded-md, font-medium)", () => {
    expect(componentsHtml).toContain("inline-flex items-center justify-center gap-2 rounded-md font-medium");
  });

  it("applies md size classes (px-4, py-2)", () => {
    expect(componentsHtml).toContain("px-4 py-2 text-sm");
  });

  it("does not have disabled or loading state on buttons", () => {
    expect(componentsHtml).not.toContain("pointer-events-none");
  });
});

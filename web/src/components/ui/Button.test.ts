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
  let indexHtml: string;

  beforeAll(() => {
    indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");
  });

  it("renders four ghost-variant buttons on homepage", () => {
    const matches = indexHtml.match(/text-gray-600 hover:text-gray-900 hover:bg-gray-100/g);
    expect(matches).toHaveLength(4);
  });

  it("renders buttons as <a> elements with correct hrefs", () => {
    expect(indexHtml).toContain('href="/docs"');
    expect(indexHtml).toContain('href="/blog"');
    expect(indexHtml).toContain('href="/faq"');
    expect(indexHtml).toContain('href="/components"');
  });

  it("applies base button classes (inline-flex, rounded-md, font-medium)", () => {
    expect(indexHtml).toContain("inline-flex items-center justify-center gap-2 rounded-md font-medium");
  });

  it("applies md size classes (px-4, py-2)", () => {
    expect(indexHtml).toContain("px-4 py-2 text-sm");
  });

  it("does not have disabled or loading state on homepage buttons", () => {
    expect(indexHtml).not.toContain("pointer-events-none");
    expect(indexHtml).not.toContain("animate-spin");
  });

  it("preserves card content inside buttons", () => {
    expect(indexHtml).toContain("Docs");
    expect(indexHtml).toContain("Blog");
    expect(indexHtml).toContain("FAQ");
    expect(indexHtml).toContain("Components");
    expect(indexHtml).toContain("Setup guides, workflow documentation, and reference material.");
  });
});

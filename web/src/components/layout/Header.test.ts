import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/**
 * Build verification tests for Header component.
 */
describe("Header component (build verification)", () => {
  let indexHtml: string;

  beforeAll(() => {
    indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");
  });

  it("renders header element with correct classes", () => {
    expect(indexHtml).toContain("border-b border-gray-200 bg-white");
  });

  it("renders nav with correct layout classes", () => {
    expect(indexHtml).toContain("mx-auto flex max-w-4xl items-center justify-between px-4 py-3");
  });

  it("renders logo linking to /", () => {
    expect(indexHtml).toContain('href="/"');
    expect(indexHtml).toContain("OpenReview");
  });

  it("renders nav links without Settings", () => {
    expect(indexHtml).toContain('href="/docs"');
    expect(indexHtml).toContain('href="/blog"');
    expect(indexHtml).toContain('href="/faq"');
    expect(indexHtml).toContain('href="/components"');
    // Settings moved to dashboard sidebar
    const headerEnd = indexHtml.indexOf('</header>');
    const headerHtml = headerEnd > 0 ? indexHtml.substring(0, headerEnd) : indexHtml;
    expect(headerHtml).not.toContain('href="/settings"');
  });

  it("nav links have hover class", () => {
    const hoverCount = (indexHtml.match(/hover:text-blue-600/g) || []).length;
    expect(hoverCount).toBeGreaterThanOrEqual(4);
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readIndexHtml } from "../../test/dist-helpers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/** Find the compiled CSS file that contains sidebar styles. */
function findSidebarCss(): string {
  const astroDir = resolve(distDir, "_astro");
  const cssFiles = readdirSync(astroDir).filter((f) => f.endsWith(".css"));
  for (const file of cssFiles) {
    const content = readFileSync(resolve(astroDir, file), "utf-8");
    if (content.includes(".sidebar")) return content;
  }
  throw new Error("No CSS file containing .sidebar found in dist/_astro");
}

describe("Sidebar (build verification)", () => {
  let html: string;
  let css: string;

  beforeAll(() => {
    html = readIndexHtml();
    css = findSidebarCss();
  });

  it("renders aside element", () => {
    expect(html).toContain("<aside");
  });

  it("contains all primary nav links", () => {
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('href="/blog"');
    expect(html).toContain('href="/faq"');
    expect(html).toContain('href="/components"');
  });

  it("contains Settings link", () => {
    expect(html).toContain('href="/settings"');
    expect(html).toContain("Settings");
  });

  it("contains sidebar toggle button", () => {
    expect(html).toContain("lucide:panel-right-open");
  });

  it("contains OpenReview branding", () => {
    expect(html).toContain("OpenReview");
  });

  it("does not contain header element", () => {
    expect(html).not.toContain("<header");
  });

  it("contains sidebar-backdrop element", () => {
    expect(html).toContain("sidebar-backdrop");
  });

  it("contains fixed positioning for mobile overlay", () => {
    // Check CSS for position:fixed (minified, no space)
    expect(css).toContain("position:fixed");
  });

  it("mobile sidebar sets main margin-left to 4rem", () => {
    // Check CSS for margin-left:4rem in the mobile media query
    expect(css).toContain("margin-left:4rem");
  });

  it("mobile sidebar is always position fixed", () => {
    // Collapsed: width 4rem (from base mobile rule)
    // Expanded: width 15rem (from data-collapsed rule)
    expect(css).toContain("width:4rem");
    expect(css).toContain("width:15rem");
  });
});

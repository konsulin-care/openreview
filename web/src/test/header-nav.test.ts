import { describe, it, expect, beforeAll } from "vitest";
import { readIndexHtml } from "./dist-helpers";

describe("header navigation (build verification)", () => {
  let html: string;

  beforeAll(() => {
    html = readIndexHtml();
  });

  it("contains Dashboard link to /", () => {
    expect(html).toContain('href="/"');
    expect(html).toContain("Dashboard");
  });

  it("does not contain Settings link in header", () => {
    // Settings moved to dashboard sidebar
    const headerEnd = html.indexOf('</header>');
    const headerHtml = headerEnd > 0 ? html.substring(0, headerEnd) : html;
    expect(headerHtml).not.toContain('href="/settings"');
  });

  it("still contains Docs link", () => {
    expect(html).toContain('href="/docs"');
    expect(html).toContain("Docs");
  });

  it("still contains Blog link", () => {
    expect(html).toContain('href="/blog"');
    expect(html).toContain("Blog");
  });

  it("still contains FAQ link", () => {
    expect(html).toContain('href="/faq"');
    expect(html).toContain("FAQ");
  });

  it("still contains Components link", () => {
    expect(html).toContain('href="/components"');
    expect(html).toContain("Components");
  });
});

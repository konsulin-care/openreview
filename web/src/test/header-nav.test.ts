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

  it("contains Settings link to /settings", () => {
    expect(html).toContain('href="/settings"');
    expect(html).toContain("Settings");
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

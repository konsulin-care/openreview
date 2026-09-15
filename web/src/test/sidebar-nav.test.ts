import { describe, it, expect, beforeAll } from "vitest";
import { readIndexHtml } from "./dist-helpers";

describe("sidebar navigation (build verification)", () => {
  let html: string;

  beforeAll(() => {
    html = readIndexHtml();
  });

  it("contains Dashboard link to /", () => {
    expect(html).toContain('href="/"');
    expect(html).toContain("Dashboard");
  });

  it("contains Docs link", () => {
    expect(html).toContain('href="/docs"');
    expect(html).toContain("Docs");
  });

  it("contains Blog link", () => {
    expect(html).toContain('href="/blog"');
    expect(html).toContain("Blog");
  });

  it("contains FAQ link", () => {
    expect(html).toContain('href="/faq"');
    expect(html).toContain("FAQ");
  });

  it("contains Components link", () => {
    expect(html).toContain('href="/components"');
    expect(html).toContain("Components");
  });

  it("contains Settings link", () => {
    expect(html).toContain('href="/settings"');
  });

  it("does not contain header element", () => {
    expect(html).not.toContain("<header");
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { readIndexHtml } from "../../test/dist-helpers";

describe("Sidebar (build verification)", () => {
  let html: string;

  beforeAll(() => {
    html = readIndexHtml();
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
});

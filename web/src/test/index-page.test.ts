import { describe, it, expect, beforeAll } from "vitest";
import { readIndexHtml } from "./dist-helpers";

describe("index page build verification", () => {
  let html: string;

  beforeAll(() => {
    html = readIndexHtml();
  });

  it("contains app-root div", () => {
    expect(html).toContain('id="app-root"');
  });

  it("contains a script tag for client-side logic", () => {
    expect(html).toContain("<script");
  });

  it("contains a loading spinner placeholder", () => {
    expect(html).toContain("animate-spin");
  });
});

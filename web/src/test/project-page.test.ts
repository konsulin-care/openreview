import { describe, it, expect, beforeAll } from "vitest";
import { readDist } from "./dist-helpers";

describe("project page build verification", () => {
  let html: string;

  beforeAll(() => {
    html = readDist("project/index.html");
  });

  it("contains app-root div", () => {
    expect(html).toContain('id="app-root"');
  });

  it("contains a script tag for client-side logic", () => {
    expect(html).toContain("<script");
  });

  it("has page title containing Project", () => {
    expect(html).toContain("Project");
  });
});

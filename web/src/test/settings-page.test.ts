import { describe, it, expect, beforeAll } from "vitest";
import { readDist } from "./dist-helpers";

describe("settings page build verification", () => {
  let html: string;

  beforeAll(() => {
    html = readDist("settings/index.html");
  });

  it("contains Settings heading", () => {
    expect(html).toContain("Settings");
  });

  it("contains actor input fields", () => {
    expect(html).toContain("actor-name");
    expect(html).toContain("actor-email");
  });
});

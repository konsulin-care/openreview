import { describe, it, expect, beforeAll } from "vitest";
import { readDist } from "./dist-helpers";

describe("initialize page build verification", () => {
  let html: string;

  beforeAll(() => {
    html = readDist("initialize/index.html");
  });

  it("exists in dist output", () => {
    expect(html).toBeTruthy();
  });

  it("contains a form with name input", () => {
    expect(html).toMatch(/<input[^>]*name=["']name["'][^>]*>/i);
  });

  it("contains a form with email input", () => {
    expect(html).toMatch(/<input[^>]*type=["']email["'][^>]*>/i);
  });

  it("contains a submit button", () => {
    expect(html).toMatch(/<button[^>]*type=["']submit["'][^>]*>/i);
  });
});

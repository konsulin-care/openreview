import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/**
 * Build verification tests for Card component.
 */
describe("Card component (build verification)", () => {
  let componentsHtml: string;

  beforeAll(() => {
    componentsHtml = readFileSync(resolve(distDir, "components/index.html"), "utf-8");
  });

  it("renders interactive cards on components page", () => {
    const matches = componentsHtml.match(/rounded-lg border border-gray-200 bg-white shadow-sm/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(1);
  });

  it("cards have interactive variant classes", () => {
    expect(componentsHtml).toContain("hover:shadow-md");
    expect(componentsHtml).toContain("cursor-pointer");
  });

  it("cards have base classes (rounded-lg, border, bg-white, shadow-sm)", () => {
    expect(componentsHtml).toContain("rounded-lg");
    expect(componentsHtml).toContain("border-gray-200");
    expect(componentsHtml).toContain("bg-white");
    expect(componentsHtml).toContain("shadow-sm");
  });
});

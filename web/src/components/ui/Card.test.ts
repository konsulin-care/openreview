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
  let indexHtml: string;

  beforeAll(() => {
    indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");
  });

  it("renders four interactive cards on homepage", () => {
    const matches = indexHtml.match(/rounded-lg border border-gray-200 bg-white shadow-sm p-8 transition hover:shadow-md cursor-pointer/g);
    expect(matches).toHaveLength(4);
  });

  it("cards have interactive variant classes", () => {
    expect(indexHtml).toContain("hover:shadow-md");
    expect(indexHtml).toContain("cursor-pointer");
  });

  it("cards have lg padding (p-8)", () => {
    expect(indexHtml).toContain("p-8");
  });

  it("cards have base classes (rounded-lg, border, bg-white, shadow-sm)", () => {
    expect(indexHtml).toContain("rounded-lg");
    expect(indexHtml).toContain("border-gray-200");
    expect(indexHtml).toContain("bg-white");
    expect(indexHtml).toContain("shadow-sm");
  });

  it("cards wrap Button components (ghost variant present)", () => {
    // Each card contains a ghost button
    expect(indexHtml).toContain("text-gray-600 hover:text-gray-900 hover:bg-gray-100");
  });
});

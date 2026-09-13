import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/**
 * Build verification tests for AppShell component.
 */
describe("AppShell component (build verification)", () => {
  let indexHtml: string;

  beforeAll(() => {
    indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");
  });

  it("renders min-h-screen wrapper", () => {
    expect(indexHtml).toContain("min-h-screen");
  });

  it("renders main content area with correct classes", () => {
    expect(indexHtml).toContain("mx-auto max-w-4xl flex-1 px-4 py-8");
  });

  it("has no sidebar markup on homepage", () => {
    expect(indexHtml).not.toContain("w-64 border-r");
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

describe("AppShell component (build verification)", () => {
  let indexHtml: string;

  beforeAll(() => {
    indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");
  });

  it("renders aside element (sidebar)", () => {
    expect(indexHtml).toContain("<aside");
  });

  it("renders main content area with flex-1", () => {
    expect(indexHtml).toContain("flex-1");
  });

  it("does not render header element", () => {
    expect(indexHtml).not.toContain("<header");
  });
});

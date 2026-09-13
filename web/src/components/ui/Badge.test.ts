import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../../../dist");

/**
 * Build verification tests for Badge component.
 */
describe("Badge component (build verification)", () => {
  let componentsHtml: string;

  beforeAll(() => {
    componentsHtml = readFileSync(resolve(distDir, "components/index.html"), "utf-8");
  });

  it("renders badge with planned status (gray variant) for button entry", () => {
    expect(componentsHtml).toContain("rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600");
  });

  it("badge renders status text content", () => {
    expect(componentsHtml).toContain("planned");
  });

  it("badge has correct base classes", () => {
    expect(componentsHtml).toContain("rounded");
    expect(componentsHtml).toContain("px-2");
    expect(componentsHtml).toContain("py-0.5");
    expect(componentsHtml).toContain("text-xs");
    expect(componentsHtml).toContain("font-medium");
  });
});

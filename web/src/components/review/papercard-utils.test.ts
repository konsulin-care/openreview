import { describe, it, expect } from "vitest";
import { getScreeningClasses } from "./papercard-utils";

describe("getScreeningClasses", () => {
  it("applies unscreened classes", () => {
    const classes = getScreeningClasses("unscreened");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-600");
  });

  it("applies included classes", () => {
    const classes = getScreeningClasses("included");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("applies excluded classes", () => {
    const classes = getScreeningClasses("excluded");
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("applies uncertain classes", () => {
    const classes = getScreeningClasses("uncertain");
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
  });

  it("includes badge base classes", () => {
    const classes = getScreeningClasses("unscreened");
    expect(classes).toContain("rounded");
    expect(classes).toContain("px-2");
    expect(classes).toContain("text-xs");
  });
});

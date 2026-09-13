import { describe, it, expect } from "vitest";
import { getSelectClasses } from "./select-utils";

describe("getSelectClasses", () => {
  it("includes base classes", () => {
    const classes = getSelectClasses();
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("border-gray-300");
    expect(classes).toContain("bg-white");
    expect(classes).toContain("focus:border-blue-500");
  });

  it("applies disabled classes", () => {
    const classes = getSelectClasses(true);
    expect(classes).toContain("cursor-not-allowed");
    expect(classes).toContain("bg-gray-50");
  });

  it("does not apply disabled classes when enabled", () => {
    const classes = getSelectClasses(false);
    expect(classes).not.toContain("cursor-not-allowed");
  });
});

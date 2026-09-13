import { describe, it, expect } from "vitest";
import { getButtonClasses, shouldRenderAsLink } from "./button-utils";

describe("getButtonClasses", () => {
  it("includes base classes", () => {
    const classes = getButtonClasses("primary");
    expect(classes).toContain("inline-flex");
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("font-medium");
  });

  it("applies primary variant classes", () => {
    const classes = getButtonClasses("primary");
    expect(classes).toContain("bg-blue-600");
    expect(classes).toContain("text-white");
    expect(classes).toContain("hover:bg-blue-700");
  });

  it("applies secondary variant classes", () => {
    const classes = getButtonClasses("secondary");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-900");
    expect(classes).toContain("hover:bg-gray-200");
  });

  it("applies ghost variant classes", () => {
    const classes = getButtonClasses("ghost");
    expect(classes).toContain("text-gray-600");
    expect(classes).toContain("hover:text-gray-900");
    expect(classes).toContain("hover:bg-gray-100");
  });

  it("applies sm size classes", () => {
    const classes = getButtonClasses("primary", "sm");
    expect(classes).toContain("px-3");
    expect(classes).toContain("py-1.5");
  });

  it("applies md size classes by default", () => {
    const classes = getButtonClasses("primary");
    expect(classes).toContain("px-4");
    expect(classes).toContain("py-2");
  });

  it("applies lg size classes", () => {
    const classes = getButtonClasses("primary", "lg");
    expect(classes).toContain("px-6");
    expect(classes).toContain("py-3");
  });

  it("adds disabled classes when disabled", () => {
    const classes = getButtonClasses("primary", "md", true);
    expect(classes).toContain("pointer-events-none");
    expect(classes).toContain("opacity-50");
  });

  it("adds disabled classes when loading", () => {
    const classes = getButtonClasses("primary", "md", false, true);
    expect(classes).toContain("pointer-events-none");
    expect(classes).toContain("opacity-50");
  });

  it("does not add disabled classes when neither disabled nor loading", () => {
    const classes = getButtonClasses("primary", "md", false, false);
    expect(classes).not.toContain("pointer-events-none");
    expect(classes).not.toContain("opacity-50");
  });
});

describe("shouldRenderAsLink", () => {
  it("returns true when href provided and not disabled/loading", () => {
    expect(shouldRenderAsLink("/docs", false, false)).toBe(true);
  });

  it("returns false when href is undefined", () => {
    expect(shouldRenderAsLink(undefined, false, false)).toBe(false);
  });

  it("returns false when disabled", () => {
    expect(shouldRenderAsLink("/docs", true, false)).toBe(false);
  });

  it("returns false when loading", () => {
    expect(shouldRenderAsLink("/docs", false, true)).toBe(false);
  });
});

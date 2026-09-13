import { describe, it, expect } from "vitest";
import { getInputClasses } from "./input-utils";

describe("getInputClasses", () => {
  it("includes base classes", () => {
    const classes = getInputClasses();
    expect(classes).toContain("block");
    expect(classes).toContain("w-full");
    expect(classes).toContain("rounded-md");
  });

  it("applies default border classes when no error", () => {
    const classes = getInputClasses();
    expect(classes).toContain("border-gray-300");
    expect(classes).toContain("focus:border-blue-500");
    expect(classes).toContain("focus:ring-blue-500");
  });

  it("applies error border classes when hasError", () => {
    const classes = getInputClasses({ hasError: true });
    expect(classes).toContain("border-red-500");
    expect(classes).toContain("focus:border-red-500");
    expect(classes).toContain("focus:ring-red-500");
    expect(classes).not.toContain("border-gray-300");
  });

  it("applies disabled classes", () => {
    const classes = getInputClasses({ disabled: true });
    expect(classes).toContain("cursor-not-allowed");
    expect(classes).toContain("bg-gray-50");
    expect(classes).toContain("text-gray-500");
  });

  it("applies both error and disabled classes", () => {
    const classes = getInputClasses({ hasError: true, disabled: true });
    expect(classes).toContain("border-red-500");
    expect(classes).toContain("cursor-not-allowed");
  });
});

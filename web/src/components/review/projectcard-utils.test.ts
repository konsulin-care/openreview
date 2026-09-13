import { describe, it, expect } from "vitest";
import { getStatusClasses } from "./projectcard-utils";

describe("getStatusClasses", () => {
  it("applies active status classes", () => {
    const classes = getStatusClasses("active");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("applies completed status classes", () => {
    const classes = getStatusClasses("completed");
    expect(classes).toContain("bg-blue-100");
    expect(classes).toContain("text-blue-800");
  });

  it("applies archived status classes", () => {
    const classes = getStatusClasses("archived");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-600");
  });

  it("includes badge base classes", () => {
    const classes = getStatusClasses("active");
    expect(classes).toContain("rounded");
    expect(classes).toContain("px-2");
    expect(classes).toContain("text-xs");
    expect(classes).toContain("font-medium");
  });
});

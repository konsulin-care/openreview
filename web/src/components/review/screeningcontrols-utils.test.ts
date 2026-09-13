import { describe, it, expect } from "vitest";
import { getDecisionClasses } from "./screeningcontrols-utils";

describe("getDecisionClasses", () => {
  it("applies include base classes", () => {
    const classes = getDecisionClasses("include", false);
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("applies exclude base classes", () => {
    const classes = getDecisionClasses("exclude", false);
    expect(classes).toContain("bg-red-100");
    expect(classes).toContain("text-red-800");
  });

  it("applies uncertain base classes", () => {
    const classes = getDecisionClasses("uncertain", false);
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
  });

  it("adds ring class when active", () => {
    const classes = getDecisionClasses("include", true);
    expect(classes).toContain("ring-2");
    expect(classes).toContain("ring-green-500");
  });

  it("does not add ring class when not active", () => {
    const classes = getDecisionClasses("include", false);
    expect(classes).not.toContain("ring-2");
  });

  it("includes button base classes", () => {
    const classes = getDecisionClasses("include", false);
    expect(classes).toContain("rounded-md");
    expect(classes).toContain("px-4");
    expect(classes).toContain("py-2");
    expect(classes).toContain("font-medium");
  });
});

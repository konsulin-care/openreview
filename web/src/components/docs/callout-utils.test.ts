import { describe, it, expect } from "vitest";
import { getCalloutClasses, getCalloutLabel } from "./callout-utils";

describe("getCalloutClasses", () => {
  it("includes base classes", () => {
    const classes = getCalloutClasses("info");
    expect(classes).toContain("rounded-r-lg");
    expect(classes).toContain("border-l-4");
    expect(classes).toContain("p-4");
  });

  it("applies info type classes", () => {
    const classes = getCalloutClasses("info");
    expect(classes).toContain("border-blue-500");
    expect(classes).toContain("bg-blue-50");
  });

  it("applies warning type classes", () => {
    const classes = getCalloutClasses("warning");
    expect(classes).toContain("border-yellow-500");
    expect(classes).toContain("bg-yellow-50");
  });

  it("applies tip type classes", () => {
    const classes = getCalloutClasses("tip");
    expect(classes).toContain("border-green-500");
    expect(classes).toContain("bg-green-50");
  });

  it("applies danger type classes", () => {
    const classes = getCalloutClasses("danger");
    expect(classes).toContain("border-red-500");
    expect(classes).toContain("bg-red-50");
  });
});

describe("getCalloutLabel", () => {
  it("returns Note for info", () => {
    expect(getCalloutLabel("info")).toBe("Note");
  });

  it("returns Warning for warning", () => {
    expect(getCalloutLabel("warning")).toBe("Warning");
  });

  it("returns Tip for tip", () => {
    expect(getCalloutLabel("tip")).toBe("Tip");
  });

  it("returns Danger for danger", () => {
    expect(getCalloutLabel("danger")).toBe("Danger");
  });
});

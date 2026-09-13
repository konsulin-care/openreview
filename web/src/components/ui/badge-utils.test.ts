import { describe, it, expect } from "vitest";
import { getBadgeClasses } from "./badge-utils";

describe("getBadgeClasses", () => {
  it("includes base classes", () => {
    const classes = getBadgeClasses("stable");
    expect(classes).toContain("rounded");
    expect(classes).toContain("px-2");
    expect(classes).toContain("py-0.5");
    expect(classes).toContain("text-xs");
    expect(classes).toContain("font-medium");
  });

  it("applies stable variant classes", () => {
    const classes = getBadgeClasses("stable");
    expect(classes).toContain("bg-green-100");
    expect(classes).toContain("text-green-800");
  });

  it("applies experimental variant classes", () => {
    const classes = getBadgeClasses("experimental");
    expect(classes).toContain("bg-yellow-100");
    expect(classes).toContain("text-yellow-800");
  });

  it("applies planned variant classes", () => {
    const classes = getBadgeClasses("planned");
    expect(classes).toContain("bg-gray-100");
    expect(classes).toContain("text-gray-600");
  });
});

import { describe, it, expect } from "vitest";
import { getCardClasses } from "./card-utils";

describe("getCardClasses", () => {
  it("includes base classes", () => {
    const classes = getCardClasses();
    expect(classes).toContain("rounded-lg");
    expect(classes).toContain("border");
    expect(classes).toContain("border-gray-200");
    expect(classes).toContain("bg-white");
    expect(classes).toContain("shadow-sm");
  });

  it("applies md padding by default", () => {
    const classes = getCardClasses();
    expect(classes).toContain("p-6");
  });

  it("applies sm padding", () => {
    const classes = getCardClasses("default", "sm");
    expect(classes).toContain("p-4");
  });

  it("applies lg padding", () => {
    const classes = getCardClasses("default", "lg");
    expect(classes).toContain("p-8");
  });

  it("default variant does not include interactive classes", () => {
    const classes = getCardClasses("default");
    expect(classes).not.toContain("hover:shadow-md");
    expect(classes).not.toContain("cursor-pointer");
  });

  it("interactive variant adds hover and cursor classes", () => {
    const classes = getCardClasses("interactive");
    expect(classes).toContain("transition");
    expect(classes).toContain("hover:shadow-md");
    expect(classes).toContain("cursor-pointer");
  });
});

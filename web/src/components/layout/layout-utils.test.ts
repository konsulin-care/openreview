import { describe, it, expect } from "vitest";
import {
  APPSHELL_CLASSES,
  HEADER_CLASSES,
  NAV_CLASSES,
  MAIN_CLASSES,
  SIDEBAR_CLASSES,
} from "./layout-utils";

describe("Layout class constants", () => {
  it("APPSHELL_CLASSES has min-h-screen", () => {
    expect(APPSHELL_CLASSES).toContain("min-h-screen");
  });

  it("HEADER_CLASSES has border-b and bg-white", () => {
    expect(HEADER_CLASSES).toContain("border-b");
    expect(HEADER_CLASSES).toContain("bg-white");
  });

  it("NAV_CLASSES has flex layout", () => {
    expect(NAV_CLASSES).toContain("flex");
    expect(NAV_CLASSES).toContain("max-w-4xl");
  });

  it("MAIN_CLASSES has max-w-4xl and padding", () => {
    expect(MAIN_CLASSES).toContain("max-w-4xl");
    expect(MAIN_CLASSES).toContain("px-4");
    expect(MAIN_CLASSES).toContain("py-8");
  });

  it("SIDEBAR_CLASSES has width and border", () => {
    expect(SIDEBAR_CLASSES).toContain("w-64");
    expect(SIDEBAR_CLASSES).toContain("border-r");
  });
});

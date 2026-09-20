import { describe, it, expect } from "vitest";
import {
  APPSHELL_CLASSES,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
  MAIN_CLASSES,
  MOBILE_BREAKPOINT,
  SWIPE_THRESHOLD,
  SIDEBAR_Z_INDEX,
} from "./layout-utils";

describe("Layout class constants", () => {
  it("APPSHELL_CLASSES has flex and min-h-screen", () => {
    expect(APPSHELL_CLASSES).toContain("flex");
    expect(APPSHELL_CLASSES).toContain("min-h-screen");
  });

  it("SIDEBAR_WIDTH_EXPANDED is w-60", () => {
    expect(SIDEBAR_WIDTH_EXPANDED).toBe("w-60");
  });

  it("SIDEBAR_WIDTH_COLLAPSED is w-16", () => {
    expect(SIDEBAR_WIDTH_COLLAPSED).toBe("w-16");
  });

  it("MAIN_CLASSES has flex-1 and transition", () => {
    expect(MAIN_CLASSES).toContain("flex-1");
    expect(MAIN_CLASSES).toContain("transition-all");
  });

  it("MOBILE_BREAKPOINT is 768", () => {
    expect(MOBILE_BREAKPOINT).toBe(768);
  });

  it("SWIPE_THRESHOLD is 50", () => {
    expect(SWIPE_THRESHOLD).toBe(50);
  });

  it("SIDEBAR_Z_INDEX is 50", () => {
    expect(SIDEBAR_Z_INDEX).toBe(50);
  });
});

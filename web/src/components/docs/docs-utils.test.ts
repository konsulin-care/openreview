import { describe, it, expect } from "vitest";
import {
  DOCNAV_CLASSES,
  TOC_CLASSES,
  TOC_ITEM_CLASSES,
  TOC_INDENT_CLASSES,
} from "./docs-utils";

describe("Docs class constants", () => {
  it("DOCNAV_CLASSES has flex layout", () => {
    expect(DOCNAV_CLASSES).toContain("flex");
    expect(DOCNAV_CLASSES).toContain("items-center");
    expect(DOCNAV_CLASSES).toContain("justify-between");
  });

  it("TOC_CLASSES has text-sm", () => {
    expect(TOC_CLASSES).toContain("text-sm");
  });

  it("TOC_ITEM_CLASSES has hover color", () => {
    expect(TOC_ITEM_CLASSES).toContain("text-gray-600");
    expect(TOC_ITEM_CLASSES).toContain("hover:text-blue-600");
  });

  it("TOC_INDENT_CLASSES has margin", () => {
    expect(TOC_INDENT_CLASSES).toContain("ml-4");
  });
});

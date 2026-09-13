import { describe, it, expect } from "vitest";
import {
  TABLE_CLASSES,
  TABLE_HEADER_CLASSES,
  TABLE_ROW_CLASSES,
  TABLE_CELL_CLASSES,
} from "./table-utils";

describe("Table class constants", () => {
  it("TABLE_CLASSES has w-full and text-sm", () => {
    expect(TABLE_CLASSES).toContain("w-full");
    expect(TABLE_CLASSES).toContain("text-sm");
  });

  it("TABLE_HEADER_CLASSES has bg-gray-50 and font-medium", () => {
    expect(TABLE_HEADER_CLASSES).toContain("bg-gray-50");
    expect(TABLE_HEADER_CLASSES).toContain("font-medium");
    expect(TABLE_HEADER_CLASSES).toContain("text-left");
  });

  it("TABLE_ROW_CLASSES has border-b", () => {
    expect(TABLE_ROW_CLASSES).toContain("border-b");
    expect(TABLE_ROW_CLASSES).toContain("border-gray-200");
  });

  it("TABLE_CELL_CLASSES has padding", () => {
    expect(TABLE_CELL_CLASSES).toContain("px-4");
    expect(TABLE_CELL_CLASSES).toContain("py-2");
  });
});

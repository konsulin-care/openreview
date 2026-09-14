/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "happy-dom",
    passWithNoTests: true,
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.js"],
    exclude: ["src/pages/**"],
  },
});

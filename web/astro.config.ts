// Astro configuration
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  server: { host: "0.0.0.0", allowedHosts: true },
  vite: {
    plugins: [tailwindcss()],
  },
});

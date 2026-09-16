// Astro configuration
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

export default defineConfig({
  output: "static",
  integrations: [icon()],
  server: { host: "0.0.0.0", allowedHosts: true },
  vite: {
    plugins: [tailwindcss()],
  },
});

/**
 * Shared helpers for build verification tests.
 *
 * These utilities read compiled output from dist/ so individual test files
 * don't duplicate the path-resolution and file-reading boilerplate.
 *
 * Requires `astro build` to have run before tests execute.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, "../../dist");

/**
 * Read a file from the dist/ directory.
 * @param relativePath — path relative to dist/, e.g. "components/index.html"
 * @returns file contents as a string
 */
export function readDist(relativePath: string): string {
  return readFileSync(resolve(DIST_DIR, relativePath), "utf-8");
}

/**
 * Read the root index.html from dist/.
 * @returns contents of dist/index.html
 */
export function readIndexHtml(): string {
  return readDist("index.html");
}

/**
 * Read the components showcase page from dist/.
 * @returns contents of dist/components/index.html
 */
export function readComponentsHtml(): string {
  return readDist("components/index.html");
}

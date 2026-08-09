import { spawnSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontend = path.join(root, "frontend");
const dist = path.join(frontend, "dist");
await mkdir(dist, { recursive: true });

await build({
  entryPoints: [path.join(frontend, "src", "entry.js")],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "transform",
  jsxFactory: "React.createElement",
  jsxFragment: "React.Fragment",
  minify: true,
  sourcemap: false,
  outfile: path.join(dist, "app.js"),
  legalComments: "none",
});

const tailwindBin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tailwindcss.cmd" : "tailwindcss",
);
const css = spawnSync(
  tailwindBin,
  [
    "-c", path.join(root, "tailwind.config.cjs"),
    "-i", path.join(frontend, "styles", "input.css"),
    "-o", path.join(dist, "app.css"),
    "--minify",
  ],
  { cwd: root, encoding: "utf8" },
);
if (css.stdout) process.stdout.write(css.stdout);
if (css.stderr) process.stderr.write(css.stderr);
if (css.status !== 0) process.exit(css.status ?? 1);

import { copyFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, ".."); // client/ directory

const files = [
  { src: "edgeone.json",         dst: ".edgeone/edgeone.json" },
  { src: "edge-functions/api.js", dst: ".edgeone/edge-functions/api.js" },
];

for (const { src, dst } of files) {
  const dstPath = resolve(root, dst);
  mkdirSync(dirname(dstPath), { recursive: true });
  copyFileSync(resolve(root, src), dstPath);
  console.log(`[postbuild] copied ${src} → ${dst}`);
}

console.log("[postbuild] edge function deploy assets ready.");

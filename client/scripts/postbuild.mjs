import { cpSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, ".."); // client/ directory

// 1. Copy edgeone.json
const srcJson = resolve(root, "edgeone.json");
const dstJson = resolve(root, ".edgeone/edgeone.json");
copyFileSafe(srcJson, dstJson);

// 2. Copy entire functions/ directory
const srcFuncs = resolve(root, "functions");
const dstFuncs = resolve(root, ".edgeone/functions");
if (existsSync(srcFuncs)) {
  cpSync(srcFuncs, dstFuncs, { recursive: true, force: true });
  console.log("[postbuild] copied functions/ → .edgeone/functions/");
} else {
  console.warn("[postbuild] WARNING: functions/ directory not found!");
}

console.log("[postbuild] EdgeOne Pages deploy assets ready.");

function copyFileSafe(src, dst) {
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst, { force: true });
  console.log(`[postbuild] copied ${src} → ${dst}`);
}

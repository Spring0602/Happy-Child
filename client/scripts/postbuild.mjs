import { copyFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
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
  copyDirSync(srcFuncs, dstFuncs);
  console.log("[postbuild] copied functions/ → .edgeone/functions/");
} else {
  console.warn("[postbuild] WARNING: functions/ directory not found!");
}

console.log("[postbuild] EdgeOne Pages deploy assets ready.");

function copyFileSafe(src, dst) {
  mkdirSync(dirname(dst), { recursive: true });
  if (existsSync(dst)) rmSync(dst, { force: true });
  copyFileSync(src, dst);
  console.log(`[postbuild] copied ${src} → ${dst}`);
}

function copyDirSync(src, dst) {
  if (existsSync(dst)) rmSync(dst, { recursive: true, force: true });
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}

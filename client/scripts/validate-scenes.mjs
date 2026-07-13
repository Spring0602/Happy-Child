import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = resolve(root, "src");
const publicRoot = resolve(root, "public");

const sceneFiles = [
  resolve(srcRoot, "data/scenes.ts"),
  resolve(srcRoot, "data/ch2Scenes.ts"),
];
const aiConfigFile = resolve(srcRoot, "data/aiSceneConfig.ts");
const characterFile = resolve(srcRoot, "data/characters.ts");

const errors = [];
const warnings = [];
const virtualSceneTargets = new Set([
  "title_screen",
  "ch3_homework_prank_liuyu_move",
  "ch3_homework_prank_zqr_move",
  "ch3_homework_prank_liuyu_hint",
  "ch3_after_exam_turn_back",
  "ch3_after_exam_liuyu_approach",
  "ch3_after_exam_liuyu_pull_aside",
  "ch6_liuyu_walks_to_player",
  "ch6_teacher_office_liuyu_leaves",
  "ch7_parent_unemployment_performance",
  "ch8_walk_to_bathroom_door_gap",
  "ch8_walk_to_bathroom_door_identity",
  "ch8_walk_to_bathroom_door_mirror",
  "ch8_open_final_save",
]);

function read(file) {
  return readFileSync(file, "utf8");
}

function collectMatches(text, regex) {
  const matches = [];
  let match = regex.exec(text);
  while (match) {
    matches.push(match);
    match = regex.exec(text);
  }
  return matches;
}

const sceneTexts = sceneFiles.map((file) => ({ file, text: read(file) }));
const allSceneText = sceneTexts.map((entry) => entry.text).join("\n");
const aiConfigText = read(aiConfigFile);
const characterText = read(characterFile);

const sceneIds = new Set();
const sceneDefinitions = new Map();

for (const { file, text } of sceneTexts) {
  for (const match of collectMatches(text, /^  ([A-Za-z0-9_]+): \{/gm)) {
    const sceneId = match[1];
    if (sceneIds.has(sceneId)) {
      errors.push(`Duplicate scene id: ${sceneId}`);
    }
    sceneIds.add(sceneId);
    sceneDefinitions.set(sceneId, file);
  }
}

if (!sceneIds.has("start")) {
  errors.push("Missing required scene id: start");
}

for (const match of collectMatches(allSceneText, /nextSceneId:\s*"([^"]+)"/g)) {
  const target = match[1];
  if (!sceneIds.has(target) && !virtualSceneTargets.has(target)) {
    errors.push(`Broken nextSceneId target: ${target}`);
  }
}

for (const match of collectMatches(allSceneText, /id:\s*"([^"]+)"\s*,\s*chapter:/g)) {
  const idProperty = match[1];
  if (!sceneIds.has(idProperty)) {
    warnings.push(`Scene object id is not a top-level key: ${idProperty}`);
  }
}

const aiConfigIds = new Set();
const embeddedArray = aiConfigText.match(/const embeddedPromptScenes = \[([\s\S]*?)\] as const;/);
if (embeddedArray) {
  for (const match of collectMatches(embeddedArray[1], /"([^"]+)"/g)) {
    aiConfigIds.add(match[1]);
  }
} else {
  errors.push("Could not locate embeddedPromptScenes in aiSceneConfig.ts");
}

for (const match of collectMatches(aiConfigText, /aiSceneConfigs\.([A-Za-z0-9_]+)/g)) {
  aiConfigIds.add(match[1]);
}

for (const sceneId of aiConfigIds) {
  if (!sceneIds.has(sceneId)) {
    errors.push(`AI scene config references missing scene: ${sceneId}`);
  }
}

for (const match of collectMatches(allSceneText, /background:\s*"([^"]*)"/g)) {
  const assetPath = match[1];
  if (!assetPath || !assetPath.startsWith("/assets/")) continue;
  const diskPath = resolve(publicRoot, assetPath.slice(1));
  if (!existsSync(diskPath)) {
    errors.push(`Missing background asset: ${assetPath}`);
  }
}

const knownSpeakers = new Set(["旁白", "主角", "主角说"]);
for (const match of collectMatches(characterText, /name:\s*"([^"]+)"/g)) knownSpeakers.add(match[1]);
for (const match of collectMatches(allSceneText, /\\n\\n\[([^\]\n]+)\]/g)) {
  const code = match[1].trim();
  if (code.startsWith("NPC:")) continue;
  if (!knownSpeakers.has(code)) warnings.push(`Unknown dialogue speaker code: [${code}]`);
}

const uniqueWarnings = [...new Set(warnings)];
const uniqueErrors = [...new Set(errors)];

console.log(`[validate-scenes] scenes: ${sceneIds.size}`);
console.log(`[validate-scenes] ai configs: ${aiConfigIds.size}`);

if (uniqueWarnings.length > 0) {
  console.warn(`[validate-scenes] warnings: ${uniqueWarnings.length}`);
  for (const warning of uniqueWarnings.slice(0, 40)) {
    console.warn(`  - ${warning}`);
  }
  if (uniqueWarnings.length > 40) {
    console.warn(`  ... ${uniqueWarnings.length - 40} more warnings`);
  }
}

if (uniqueErrors.length > 0) {
  console.error(`[validate-scenes] errors: ${uniqueErrors.length}`);
  for (const error of uniqueErrors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log("[validate-scenes] ok");

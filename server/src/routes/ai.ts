import { Router } from "express";
import { analyzeChoicePrompt } from "../prompts/analyzeChoice";
import { npcDialoguePrompt } from "../prompts/npcDialogue";
import { endingJudgePrompt } from "../prompts/endingJudge";
import { sceneFragmentPrompt } from "../prompts/sceneFragment";
import { callLLM } from "../services/llm";
import { generatePersonalityPortrait } from "../services/personalityPortrait";

export const aiRouter = Router();

function getAIErrorMessage(error: unknown, fallback: string): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const safeMessage = rawMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***");
  const jsonStart = safeMessage.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const payload = JSON.parse(safeMessage.slice(jsonStart));
      const providerMessage = payload?.error?.message_zh || payload?.error?.message;
      if (typeof providerMessage === "string" && providerMessage.trim()) return providerMessage.trim();
    } catch {
      // Fall through to the sanitized raw message.
    }
  }
  return safeMessage || fallback;
}

function getAIErrorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  const match = message.match(/请求失败 \((\d{3})\)|failed \((\d{3})\)/);
  const providerStatus = Number(match?.[1] || match?.[2]);
  if (providerStatus === 401 || providerStatus === 403) return providerStatus;
  if (providerStatus >= 400 && providerStatus < 500) return 502;
  return 500;
}

aiRouter.post("/analyze-choice", async (req, res) => {
  try {
    const { gameState, choiceId } = req.body;
    const prompt = analyzeChoicePrompt(gameState, choiceId);
    const result = await callLLM(prompt, "choice_analysis");
    res.json({ ok: true, result });
  } catch (error) {
    console.error("[AI] analyze-choice failed:", error);
    res.status(500).json({ ok: false, message: "analyze-choice failed" });
  }
});

aiRouter.post("/npc-dialogue", async (req, res) => {
  try {
    const { gameState, npcId } = req.body;
    const prompt = npcDialoguePrompt(gameState, npcId);
    const result = await callLLM(prompt, "npc_dialogue");
    res.json({ ok: true, result });
  } catch (error) {
    console.error("[AI] npc-dialogue failed:", error);
    res.status(500).json({ ok: false, message: "npc-dialogue failed" });
  }
});

aiRouter.post("/generate-scene", async (req, res) => {
  try {
    const { gameState, sceneId, mode, prompt, context, requiredLines } = req.body;
    if (!gameState || typeof sceneId !== "string" || typeof prompt !== "string") {
      res.status(400).json({ ok: false, message: "invalid scene generation request" });
      return;
    }
    const normalizedContext = typeof context === "string" ? context : "";
    const normalizedMode = mode === "dialogue" ? "dialogue" : "fragment";
    const normalizedRequiredLines = Array.isArray(requiredLines)
      ? requiredLines.filter((line): line is string => typeof line === "string")
      : [];
    const result = await callLLM(
      sceneFragmentPrompt(gameState, sceneId, normalizedMode, normalizedContext, prompt, normalizedRequiredLines),
      "scene_fragment"
    );
    if (typeof result.script === "string") {
      const missing = normalizedRequiredLines.filter((line) => {
        const spokenText = line.replace(/^\[[^\]]+\]\s*/, "");
        return spokenText && !(result.script as string).includes(spokenText);
      });
      if (missing.length > 0) {
        result.script = `${missing.join("\n\n")}\n\n${result.script}`;
      }
    }
    res.json({ ok: true, result });
  } catch (error) {
    console.error("[AI] generate-scene failed:", error);
    res.status(getAIErrorStatus(error)).json({ ok: false, message: getAIErrorMessage(error, "generate-scene failed") });
  }
});

aiRouter.post("/judge-ending", async (req, res) => {
  try {
    const { gameState } = req.body;
    const prompt = endingJudgePrompt(gameState);
    const result = await callLLM(prompt, "ending_judge");
    res.json({ ok: true, result });
  } catch (error) {
    console.error("[AI] judge-ending failed:", error);
    res.status(500).json({ ok: false, message: "judge-ending failed" });
  }
});

aiRouter.post("/personality-portrait", async (req, res) => {
  try {
    const { gameState } = req.body;
    const result = await generatePersonalityPortrait(gameState);
    res.json({ ok: true, result });
  } catch (error) {
    console.error("[AI] personality-portrait failed:", error);
    res.status(500).json({ ok: false, message: "personality-portrait failed" });
  }
});

import { Router } from "express";
import { analyzeChoicePrompt } from "../prompts/analyzeChoice";
import { npcDialoguePrompt } from "../prompts/npcDialogue";
import { endingJudgePrompt } from "../prompts/endingJudge";
import { sceneFragmentPrompt } from "../prompts/sceneFragment";
import { callLLM } from "../services/llm";
import { generatePersonalityPortrait } from "../services/personalityPortrait";

export const aiRouter = Router();

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
    res.status(500).json({ ok: false, message: "generate-scene failed" });
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

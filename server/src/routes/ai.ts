import { Router } from "express";
import { analyzeChoicePrompt } from "../prompts/analyzeChoice";
import { npcDialoguePrompt } from "../prompts/npcDialogue";
import { endingJudgePrompt } from "../prompts/endingJudge";
import { callLLM } from "../services/llm";

export const aiRouter = Router();

aiRouter.post("/analyze-choice", async (req, res) => {
  try {
    const { gameState, choiceId } = req.body;
    const prompt = analyzeChoicePrompt(gameState, choiceId);
    const result = await callLLM(prompt, "choice_analysis");
    res.json({ ok: true, result });
  } catch (error) {
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
    res.status(500).json({ ok: false, message: "npc-dialogue failed" });
  }
});

aiRouter.post("/judge-ending", async (req, res) => {
  try {
    const { gameState } = req.body;
    const prompt = endingJudgePrompt(gameState);
    const result = await callLLM(prompt, "ending_judge");
    res.json({ ok: true, result });
  } catch (error) {
    res.status(500).json({ ok: false, message: "judge-ending failed" });
  }
});

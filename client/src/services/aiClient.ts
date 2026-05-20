import type { GameState } from "../types/game";

const API_BASE = import.meta.env.VITE_AI_SERVER_URL ?? "http://localhost:3001";

async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function analyzeChoice(gameState: GameState, choiceId: string) {
  return postJSON<{ ok: boolean; result: unknown }>("/api/analyze-choice", {
    gameState,
    choiceId,
  });
}

export async function generateNpcDialogue(gameState: GameState, npcId: string) {
  return postJSON<{ ok: boolean; result: unknown }>("/api/npc-dialogue", {
    gameState,
    npcId,
  });
}

export async function judgeEnding(gameState: GameState) {
  return postJSON<{ ok: boolean; result: unknown }>("/api/judge-ending", {
    gameState,
  });
}

import type { PhaserToReactEvent, ReactToPhaserCommand } from "../types/gameMap";
import type { GameState } from "../../types/game";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyListener = (event: any) => void;

/**
 * Phaser ↔ React 通信桥（发布-订阅模式）
 *
 * 使用方式：
 * - React 侧：gameBridge.onPhaserEvent(...) 监听 Phaser 事件（自动类型推断）
 * - Phaser 侧：gameBridge.onReactCommand(...) 监听 React 指令
 * - 跨引擎通信：sendToReact / sendToPhaser
 */
class GameBridge {
  private phaserListeners = new Map<string, AnyListener[]>();
  private reactListeners = new Map<string, AnyListener[]>();
  private _gameState: GameState | null = null;

  /** Phaser 侧调用：监听 React 发来的指令 */
  onReactCommand(type: ReactToPhaserCommand["type"], handler: AnyListener): void;
  // prettier-ignore
  onReactCommand(type: string, handler: AnyListener) {
    if (!this.phaserListeners.has(type)) this.phaserListeners.set(type, []);
    this.phaserListeners.get(type)!.push(handler);
  }

  /** React 侧调用：监听 Phaser 发来的事件 */
  onPhaserEvent(type: "TRIGGER_DIALOGUE", handler: (e: Extract<PhaserToReactEvent, { type: "TRIGGER_DIALOGUE" }>) => void): void;
  onPhaserEvent(type: "TRIGGER_ITEM", handler: (e: Extract<PhaserToReactEvent, { type: "TRIGGER_ITEM" }>) => void): void;
  onPhaserEvent(type: "TRIGGER_DOOR", handler: (e: Extract<PhaserToReactEvent, { type: "TRIGGER_DOOR" }>) => void): void;
  // prettier-ignore
  onPhaserEvent(type: string, handler: AnyListener) {
    if (!this.reactListeners.has(type)) this.reactListeners.set(type, []);
    this.reactListeners.get(type)!.push(handler);
  }

  /** React → Phaser */
  sendToPhaser(command: ReactToPhaserCommand) {
    const handlers = this.phaserListeners.get(command.type) || [];
    handlers.forEach((h) => h(command));
  }

  /** Phaser → React */
  sendToReact(event: PhaserToReactEvent) {
    const handlers = this.reactListeners.get(event.type) || [];
    handlers.forEach((h) => h(event));
  }

  /** 共享 GameState */
  set gameState(state: GameState | null) { this._gameState = state; }
  get gameState() { return this._gameState; }

  /** 清理所有监听器 */
  removeAllListeners() {
    this.phaserListeners.clear();
    this.reactListeners.clear();
  }
}

export const gameBridge = new GameBridge();

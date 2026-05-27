import type { PhaserToReactEvent, ReactToPhaserCommand } from "../types/gameMap";
import type { GameState } from "../../types/game";

type Listener<T> = (event: T) => void;

/**
 * Phaser ↔ React 通信桥（发布-订阅模式）
 * 
 * 使用方式：
 * - React 侧：gameBridge.onPhaserEvent(...) 监听 Phaser 事件
 * - Phaser 侧：gameBridge.onReactCommand(...) 监听 React 指令
 * - 跨引擎通信：sendToReact / sendToPhaser
 */
class GameBridge {
  private phaserListeners = new Map<string, Listener<ReactToPhaserCommand>[]>();
  private reactListeners = new Map<string, Listener<PhaserToReactEvent>[]>();
  private _gameState: GameState | null = null;

  /** Phaser 侧调用：监听 React 发来的指令 */
  onReactCommand(type: string, handler: Listener<ReactToPhaserCommand>) {
    if (!this.phaserListeners.has(type)) this.phaserListeners.set(type, []);
    this.phaserListeners.get(type)!.push(handler);
  }

  /** React 侧调用：监听 Phaser 发来的事件 */
  onPhaserEvent(type: string, handler: Listener<PhaserToReactEvent>) {
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

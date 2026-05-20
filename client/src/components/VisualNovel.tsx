import type { Choice, Scene } from "../types/game";
import { DialogueBox } from "./DialogueBox";
import { ChoicePanel } from "./ChoicePanel";
import { SceneBackground } from "./SceneBackground";

interface Props {
  scene: Scene;
  onNext: (nextSceneId: string) => void;
  onChoose: (choice: Choice) => void;
  onAIEvent: () => void;
}

export function VisualNovel({ scene, onNext, onChoose, onAIEvent }: Props) {
  return (
    <div className="vn-root">
      <SceneBackground src={scene.background} />

      <div className="chapter-badge">{scene.chapter}</div>

      <div className="vn-content">
        <DialogueBox speaker={scene.speaker} text={scene.text} />

        {scene.choices && scene.choices.length > 0 ? (
          <ChoicePanel choices={scene.choices} onChoose={onChoose} />
        ) : scene.aiEvent ? (
          <button className="next-button" onClick={onAIEvent}>
            启动 AI 分析
          </button>
        ) : (
          scene.nextSceneId && (
            <button
              className="next-button"
              onClick={() => onNext(scene.nextSceneId!)}
            >
              继续
            </button>
          )
        )}
      </div>
    </div>
  );
}

import Phaser from "phaser";
import { AssetManifest } from "./assetManifest";

const directions = ["left", "right", "front", "back"] as const;

function characterName(frameKey: string) {
  return frameKey.endsWith("_frames") ? frameKey.slice(0, -"_frames".length) : frameKey;
}

function movementDirection(direction: typeof directions[number]) {
  if (direction === "front") return "down";
  if (direction === "back") return "up";
  return direction;
}

function createAnimation(
  scene: Phaser.Scene,
  key: string,
  frames: Phaser.Types.Animations.AnimationFrame[],
  frameRate: number,
  repeat: number
) {
  if (scene.anims.exists(key)) return;
  scene.anims.create({ key, frames, frameRate, repeat });
}

export function createPlayerAnimations(scene: Phaser.Scene) {
  for (const character of AssetManifest.frames) {
    const name = characterName(character.key);

    if ("run" in character && character.run) {
      for (const direction of directions) {
        createAnimation(
          scene,
          `${name}_run_${movementDirection(direction)}`,
          Array.from({ length: 6 }, (_, index) => ({
            key: `${character.key}_${direction}_${index}`,
          })),
          10,
          -1
        );
      }
    }

    if ("stand" in character && character.stand) {
      for (const direction of directions) {
        createAnimation(
          scene,
          `${name}_idle_${movementDirection(direction)}`,
          [{ key: `${character.key}_stand_${direction}_0` }],
          1,
          0
        );
      }
    }

    if ("sit" in character && character.sit) {
      for (const direction of directions) {
        createAnimation(
          scene,
          `${name}_sit_${movementDirection(direction)}`,
          [{ key: `${character.key}_sit_${direction}_0` }],
          1,
          0
        );
      }
    }
  }
}

import type { Choice } from "../types/game";

interface Props {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
}

export function ChoicePanel({ choices, onChoose }: Props) {
  return (
    <div className="choice-panel">
      {choices.map((choice) => (
        <button
          key={choice.id}
          className="choice-button"
          onClick={() => onChoose(choice)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}

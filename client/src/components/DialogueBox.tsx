interface Props {
  speaker?: string;
  text: string;
}

export function DialogueBox({ speaker, text }: Props) {
  return (
    <div className="dialogue-box">
      {speaker && <div className="speaker-name">{speaker}</div>}
      <div className="dialogue-text">{text}</div>
    </div>
  );
}

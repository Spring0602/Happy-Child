interface Props {
  src: string;
}

export function SceneBackground({ src }: Props) {
  return (
    <div
      className="scene-background"
      style={{
        backgroundImage: `url(${src})`,
      }}
    />
  );
}

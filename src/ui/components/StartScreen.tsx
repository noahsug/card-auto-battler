import Button from './Button';

interface Props {
  onNewGame: () => void;
}

export default function StartScreen({ onNewGame }: Props) {
  return (
    <div>
      <div>START</div>
      <Button onClick={onNewGame}>start</Button>
    </div>
  );
}

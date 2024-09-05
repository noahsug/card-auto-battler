import Button from './Button';

interface Props {
  onNewGame: () => void;
}

export default function WinScreen({ onNewGame }: Props) {
  return (
    <div>
      <div>WIN</div>
      <Button onClick={onNewGame}>start</Button>
    </div>
  );
}

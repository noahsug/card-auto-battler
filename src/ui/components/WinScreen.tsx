import ScreenContainer from './ScreenContainer';

interface Props {
  onNewGame: () => void;
}

export default function WinScreen({ onNewGame }: Props) {
  return (
    <ScreenContainer>
      <div>WIN</div>
      <button onClick={onNewGame}>start</button>
    </ScreenContainer>
  );
}

import ScreenContainer from './ScreenContainer';

interface Props {
  onNewGame: () => void;
}

export default function StartScreen({ onNewGame }: Props) {
  return (
    <ScreenContainer>
      <div>START</div>
      <button onClick={onNewGame}>start</button>
    </ScreenContainer>
  );
}

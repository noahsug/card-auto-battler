import ScreenContainer from './ScreenContainer';

interface Props {
  onWin: () => void;
  onLose: () => void;
}

export default function GameplayScreen({ onWin: handleWin, onLose: handleLose }: Props) {
  return (
    <ScreenContainer>
      <div>GAMEPLAY</div>
      <button onClick={handleWin}>win</button>
      <button onClick={handleLose}>lose</button>
    </ScreenContainer>
  );
}

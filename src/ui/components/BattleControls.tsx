import { styled } from 'styled-components';

import pauseImage from '../images/icons/pause.png';
import playImage from '../images/icons/play.png';
import nextImage from '../images/icons/arrow.png';

interface Props {
  onBack: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  canGoBack: boolean;
  isPlaying: boolean;
}

export default function BattleControls({
  onBack,
  onTogglePlay,
  onNext,
  canGoBack,
  isPlaying,
}: Props) {
  return (
    <ControlsRow>
      <ControlButton onClick={onBack} disabled={!canGoBack}>
        <img src={nextImage} alt="back" />
      </ControlButton>

      <ControlButton onClick={onTogglePlay}>
        {isPlaying ? <img src={pauseImage} alt="pause" /> : <img src={playImage} alt="play" />}
      </ControlButton>

      <ControlButton onClick={onNext} $flip={true}>
        <img src={nextImage} alt="next" />
      </ControlButton>
    </ControlsRow>
  );
}

const ControlsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: end;
  flex: 1;
`;

const ControlButton = styled.button<{ $flip?: boolean }>`
  background: none;
  border: none;
  transform: ${(props) => (props.$flip ? 'scaleX(-1)' : 'none')};
  cursor: pointer;
  width: 4rem;

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  img {
    height: 2rem;
  }
`;

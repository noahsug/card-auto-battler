import { useEffect } from 'react';
import { styled } from 'styled-components';

import { Image } from '../shared/Image';
import nextImage from './next.png';
import pauseImage from './pause.png';
import playImage from './play.png';

const ControlsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
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

  ${Image} {
    height: 2rem;
  }
`;

interface Props {
  onBack?: () => void;
  onTogglePlay?: () => void;
  onNext?: () => void;
  isPaused: boolean;
}

function useKeyboardShortcuts({
  onBack,
  onTogglePlay,
  onNext,
}: Pick<Props, 'onBack' | 'onTogglePlay' | 'onNext'>) {
  useEffect(() => {
    function handleKeyboardShortcuts(event: globalThis.KeyboardEvent) {
      switch (event.key) {
        case ' ':
          onTogglePlay?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case 'ArrowLeft':
          onBack?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [onBack, onTogglePlay, onNext]);
}

export function BattleControls({ onBack, onTogglePlay, onNext, isPaused }: Props) {
  useKeyboardShortcuts({
    onBack,
    onTogglePlay,
    onNext,
  });

  return (
    <ControlsRow>
      <ControlButton onClick={onBack} disabled={!onBack} $flip={true}>
        <Image src={nextImage} alt="back" />
      </ControlButton>

      <ControlButton onClick={onTogglePlay} disabled={!onTogglePlay}>
        <Image src={isPaused ? playImage : pauseImage} alt="play/pause" />
      </ControlButton>

      <ControlButton onClick={onNext} disabled={!onNext}>
        <Image src={nextImage} alt="next" />
      </ControlButton>
    </ControlsRow>
  );
}

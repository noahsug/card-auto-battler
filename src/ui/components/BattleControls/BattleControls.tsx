import { useEffect, useRef } from 'react';
import { styled } from 'styled-components';

import nextImage from './next.png';
import pauseImage from './pause.png';
import playImage from './play.png';
import { useTimeout } from '../../hooks/useTimeout';

const AUTO_PLAY_CARD_DELAY = 1000;

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

  img {
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
  useKeyboardShortcuts({ onBack, onTogglePlay, onNext });

  const callback = onNext || (() => {});

  useTimeout(callback, AUTO_PLAY_CARD_DELAY, { stop: isPaused || !onNext });

  return (
    <ControlsRow>
      <ControlButton onClick={onBack} disabled={!onBack} $flip={true}>
        <img src={nextImage} alt="back" />
      </ControlButton>

      <ControlButton onClick={onTogglePlay} disabled={!onTogglePlay}>
        <img src={isPaused ? playImage : pauseImage} alt="play/pause" />
      </ControlButton>

      <ControlButton onClick={onNext} disabled={!onNext}>
        <img src={nextImage} alt="next" />
      </ControlButton>
    </ControlsRow>
  );
}

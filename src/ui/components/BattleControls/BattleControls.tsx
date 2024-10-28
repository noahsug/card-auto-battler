import { useEffect } from 'react';
import { styled } from 'styled-components';

import { useTimeout } from '../../hooks/useTimeout';
import nextImage from './next.png';
import pauseImage from './pause.png';
import playImage from './play.png';
import { Image } from '../shared/Image';

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
}: Pick<Required<Props>, 'onBack' | 'onTogglePlay' | 'onNext'>) {
  useEffect(() => {
    function handleKeyboardShortcuts(event: globalThis.KeyboardEvent) {
      switch (event.key) {
        case ' ':
          onTogglePlay();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'ArrowLeft':
          onBack();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [onBack, onTogglePlay, onNext]);
}

export function BattleControls({ onBack, onTogglePlay, onNext, isPaused }: Props) {
  function handleOnBack() {
    if (!onBack) return;
    if (!isPaused) {
      // pause
      onTogglePlay?.();
    }
    onBack();
  }

  function handleOnTogglePlay() {
    if (!onTogglePlay) return;
    if (isPaused) {
      // immediately play next card when unpausing
      onNext?.();
    }
    onTogglePlay();
  }

  function handleOnNext() {
    if (!onNext) return;
    if (!isPaused) {
      // pause
      onTogglePlay?.();
    }
    onNext();
  }

  useKeyboardShortcuts({
    onBack: handleOnBack,
    onTogglePlay: handleOnTogglePlay,
    onNext: handleOnNext,
  });

  const callback = onNext || (() => {});

  useTimeout(callback, AUTO_PLAY_CARD_DELAY, { stop: isPaused || !onNext });

  return (
    <ControlsRow>
      <ControlButton onClick={handleOnBack} disabled={!onBack} $flip={true}>
        <Image src={nextImage} alt="back" />
      </ControlButton>

      <ControlButton onClick={handleOnTogglePlay} disabled={!onTogglePlay}>
        <Image src={isPaused ? playImage : pauseImage} alt="play/pause" />
      </ControlButton>

      <ControlButton onClick={handleOnNext} disabled={!onNext}>
        <Image src={nextImage} alt="next" />
      </ControlButton>
    </ControlsRow>
  );
}

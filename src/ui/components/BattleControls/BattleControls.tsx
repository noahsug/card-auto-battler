import { useEffect } from 'react';
import { styled } from 'styled-components';

import fastForwardImage from './arrows.png';
import undoImage from './undo.png';
import pauseImage from './pause.png';
import playImage from './play.png';
import { maskImage } from '../../style';

const ControlsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-bottom: 1rem;
`;

const ControlButton = styled.div<{ $flip?: boolean; disabled: boolean }>`
  transform: ${(props) => (props.$flip ? 'scaleX(-1)' : 'none')};
  cursor: pointer;
  width: 2.5rem;
  height: 2.5rem;

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function backgroundColor({ $highlight }: { $highlight?: boolean }) {
  return $highlight ? '#ffe300' : 'var(--color-primary)';
}

const MaskedImage = styled.div<{ src: string; $highlight?: boolean }>`
  height: 2rem;
  width: 2rem;
  ${maskImage}
  background-color: ${backgroundColor};

  ${(props) => props.$highlight && `animation: highlight 0.5s infinite alternate;`}
`;

interface Props {
  onBack?: () => void;
  onTogglePlay?: () => void;
  onToggleFastForward?: () => void;
  isFastForwarding: boolean;
  isPaused: boolean;
}

function useKeyboardShortcuts({
  onBack,
  onTogglePlay,
  onToggleFastForward,
}: Pick<Props, 'onBack' | 'onTogglePlay' | 'onToggleFastForward'>) {
  useEffect(() => {
    function handleKeyboardShortcuts(event: globalThis.KeyboardEvent) {
      switch (event.key) {
        case ' ':
          onTogglePlay?.();
          break;
        case 'ArrowRight':
          onToggleFastForward?.();
          break;
        case 'ArrowLeft':
          onBack?.();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [onBack, onTogglePlay, onToggleFastForward]);
}

export function BattleControls({
  onBack,
  onTogglePlay,
  onToggleFastForward,
  isPaused,
  isFastForwarding,
}: Props) {
  useKeyboardShortcuts({
    onBack,
    onTogglePlay,
    onToggleFastForward: onToggleFastForward,
  });

  return (
    <ControlsRow>
      <ControlButton onClick={onBack} disabled={!onBack}>
        <MaskedImage src={undoImage} />
      </ControlButton>

      <ControlButton onClick={onTogglePlay} disabled={!onTogglePlay}>
        <MaskedImage src={isPaused ? playImage : pauseImage} />
      </ControlButton>

      <ControlButton onClick={onToggleFastForward} disabled={!onToggleFastForward}>
        <MaskedImage src={fastForwardImage} $highlight={isFastForwarding} />
      </ControlButton>
    </ControlsRow>
  );
}

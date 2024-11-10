import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { CardState } from '../../../game/gameState';
import { baseCardSize, cardSizeScaling } from '../Card';
import { CardStackAnimation } from './CardStackAnimation2';

const ANIMATED_EVENT_TYPES = new Set<BattleEvent['type']>([
  'startBattle',
  'playCard',
  'discardCard',
  'trashCard',
  'shuffle',
  'addTemporaryCard',
]);

export type AnimationCompleteEvent = 'applyCardEffects' | 'playCard';

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  events: BattleEvent[];
  onAnimationComplete: (type: AnimationCompleteEvent) => void;
  opponentRect: DOMRect | null;
}

const cardSize = {
  height: baseCardSize.height * cardSizeScaling.medium,
  width: baseCardSize.width * cardSizeScaling.medium,
};

const Root = styled.div`
  position: relative;

  height: ${cardSize.height}rem;
  width: ${cardSize.width}rem;
`;

export function CardStack(props: Props) {
  const { opponentRect, onAnimationComplete } = props;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const events = useRef<BattleEvent[]>([]);
  const visitedEventLists = useRef(new Set<BattleEvent[]>());
  const [eventIndex, setEventIndex] = useState<number>(-1);

  const cardPlayedTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleNextEvent = useCallback(() => {
    const finishedEventType = events.current[eventIndex]?.type;
    const nextEventType = events.current[eventIndex + 1]?.type;
    const nextNextEventType = events.current[eventIndex + 2]?.type;
    setEventIndex((prev) => prev + 1);

    if (nextEventType === 'shuffle' && !nextNextEventType) {
      // end the animation early if all we have left to do is shuffle the cards
      onAnimationComplete('applyCardEffects');
    } else if (
      !nextEventType &&
      finishedEventType !== 'shuffle' &&
      finishedEventType !== 'startBattle'
    ) {
      // end the animation if there are no events left (unless we already ended it early due to
      // not waiting for the shuffle animation or we're starting the battle)
      onAnimationComplete('applyCardEffects');
    } else if (nextEventType === 'playCard') {
      cardPlayedTimeout.current = setTimeout(() => {
        onAnimationComplete('playCard');
      }, 200);
    }
  }, [eventIndex, onAnimationComplete]);

  // add new events to the animation queue
  if (!visitedEventLists.current.has(props.events)) {
    visitedEventLists.current.add(props.events);
    const prevEvent = events.current[eventIndex];
    events.current.push(...props.events.filter((e) => ANIMATED_EVENT_TYPES.has(e.type)));
    if (!prevEvent) {
      handleNextEvent();
    }
  }

  return (
    <Root ref={setContainer}>
      {container && opponentRect && (
        <CardStackAnimation
          {...props}
          event={events.current[eventIndex]}
          deckRect={container.getBoundingClientRect()}
          opponentRect={opponentRect}
          onAnimationComplete={handleNextEvent}
        />
      )}
    </Root>
  );
}

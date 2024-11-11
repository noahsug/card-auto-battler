import { useCallback, useEffect, useRef, useState } from 'react';
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

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  events: BattleEvent[];
  onAnimationComplete: () => void;
  opponentRect: DOMRect | undefined;
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
  const [eventIndex, setEventIndex] = useState<number>(0);

  // add new events to the animation queue
  if (!visitedEventLists.current.has(props.events)) {
    visitedEventLists.current.add(props.events);
    events.current.push(...props.events.filter((e) => ANIMATED_EVENT_TYPES.has(e.type)));
  }
  const event = events.current[eventIndex];

  // handle calling onAnimationComplete when certain animations are finished
  const cardPlayedTimeout = useRef<NodeJS.Timeout>();
  useEffect(() => {
    const prevEvent = events.current[eventIndex - 1];
    const nextEventType = events.current[eventIndex + 1]?.type;

    if (event?.type === 'shuffle' && !nextEventType) {
      // end the animation early if all we have left to do is shuffle the cards
      onAnimationComplete();
    } else if (
      !event &&
      prevEvent &&
      prevEvent?.type !== 'shuffle' &&
      prevEvent?.type !== 'startBattle'
    ) {
      // end the animation if there are no events left (unless we already ended it early due to
      // not waiting for the shuffle animation or we're starting the battle)
      onAnimationComplete();
    } else if (event?.type === 'playCard' && cardPlayedTimeout.current == null) {
      cardPlayedTimeout.current = setTimeout(() => {
        onAnimationComplete();
        cardPlayedTimeout.current = undefined;
      }, 200);
    }
  }, [event, eventIndex, onAnimationComplete]);

  return (
    <Root ref={setContainer}>
      {container && opponentRect && (
        <CardStackAnimation
          {...props}
          event={event}
          deckRect={container.getBoundingClientRect()}
          opponentRect={opponentRect}
          onAnimationComplete={() => setEventIndex((prev) => prev + 1)}
        />
      )}
    </Root>
  );
}

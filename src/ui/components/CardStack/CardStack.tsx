import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { CardState } from '../../../game/gameState';
import { baseCardSize, cardSizeScaling } from '../Card';
import { CardStackAnimation } from './CardStackAnimation';
import { useGetBoundingRect } from '../../hooks/useBoundingRect';

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
  opponentBoundingRect: DOMRect | null;
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
  const { opponentBoundingRect, onAnimationComplete } = props;
  const [handleRef, getBoundingRect] = useGetBoundingRect();
  const boundingRect = getBoundingRect();

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
  const visitedEventInfo = useRef<{ eventIndex: number; event?: BattleEvent }>({ eventIndex: -1 });
  useEffect(() => {
    // ensure we don't handle the same event twice
    if (
      eventIndex === visitedEventInfo.current.eventIndex &&
      event === visitedEventInfo.current.event
    ) {
      return;
    }
    visitedEventInfo.current = { eventIndex, event };

    const prevEvent = events.current[eventIndex - 1];
    const nextEvent = events.current[eventIndex + 1];

    if (event?.type === 'shuffle' && !nextEvent) {
      // end the animation early if all we have left to do is shuffle the cards
      onAnimationComplete();
    } else if (
      !event &&
      prevEvent &&
      prevEvent?.type !== 'shuffle' &&
      prevEvent?.type !== 'startBattle' &&
      prevEvent?.type !== 'playCard'
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

  const handleAnimationComplete = useCallback(() => {
    setEventIndex((prev) => prev + 1);
  }, []);

  return (
    <Root ref={handleRef}>
      {boundingRect && opponentBoundingRect && (
        <CardStackAnimation
          {...props}
          event={event}
          deckBoundingRect={boundingRect}
          opponentBoundingRect={opponentBoundingRect}
          onAnimationComplete={handleAnimationComplete}
        />
      )}
    </Root>
  );
}

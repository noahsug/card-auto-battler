import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { BattleEvent } from '../../../game/actions/battleEvent';
import { CardState } from '../../../game/gameState';
import { baseCardSize, cardSizeScaling } from '../Card';
import { CardStackAnimation } from './CardStackAnimation';
import { useGetBoundingRect } from '../../hooks/useBoundingRect';

const ANIMATED_EVENT_TYPES = new Set<BattleEvent['type']>([
  'undo',
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
  isPaused: boolean;
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
  const [eventIndex, setEventIndex] = useState<number>(0);
  const visitedEventLists = useRef(new Set<BattleEvent[]>());
  const visitedEventInfo = useRef<{ eventIndex: number; event?: BattleEvent }>({ eventIndex: -1 });

  const cardPlayedTimeout = useRef<NodeJS.Timeout>();

  const animateWhenUnpaused = useRef(false);
  const isPaused = useRef(false);

  // add new events to the animation queue
  if (!visitedEventLists.current.has(props.events)) {
    visitedEventLists.current.add(props.events);
    const newEvents = props.events.filter((e) => ANIMATED_EVENT_TYPES.has(e.type));
    events.current.push(...newEvents);
  }
  const event = events.current[eventIndex];

  isPaused.current = props.isPaused && event?.type === 'playCard';

  // // TODO: make this a const, not a ref
  // pausedEvent.current =
  //   props.isPaused && events.current[eventIndex - 1]?.type === 'playCard'
  //     ? events.current[eventIndex - 1]
  //     : undefined;

  // console.log(
  //   'M',
  //   events.current[eventIndex - 1]?.type,
  //   events.current[eventIndex]?.type,
  //   events.current[eventIndex + 1]?.type,
  // );

  // undo
  useEffect(() => {
    const undoIndex = events.current.findLastIndex((e) => e.type === 'undo');
    if (eventIndex < undoIndex) {
      setEventIndex(undoIndex);
      cardPlayedTimeout.current && clearTimeout(cardPlayedTimeout.current);
      cardPlayedTimeout.current = undefined;
      return;
    }
  }, [eventIndex, props.events]);

  // handle calling onAnimationComplete when certain animations are finished
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
      console.log('M done shuffle');
      onAnimationComplete();
    } else if (
      !event &&
      prevEvent &&
      prevEvent?.type !== 'undo' &&
      prevEvent?.type !== 'shuffle' &&
      prevEvent?.type !== 'startBattle' &&
      prevEvent?.type !== 'playCard'
    ) {
      // end the animation if there are no events left (unless we hit a special use case like the
      // playCard timeout, or startBattle or shuffle events)
      console.log('M done');
      onAnimationComplete();
    } else if (event?.type === 'playCard' && cardPlayedTimeout.current == null) {
      cardPlayedTimeout.current = setTimeout(() => {
        console.log('M done playCard');
        onAnimationComplete();
        cardPlayedTimeout.current = undefined;
      }, 200);
    }
  }, [event, eventIndex, isPaused, onAnimationComplete]);

  // const handleAnimationComplete = useCallback(() => {
  //   console.log('A-> M onAnimationComplete', !isPaused.current);
  //   // if (isPaused.current) return;
  //   setEventIndex((prev) => prev + 1);
  // }, []);

  const handleAnimationComplete = useCallback(() => {
    if (animateWhenUnpaused.current) return;

    if (isPaused.current) {
      // animate the next event when we unpause
      animateWhenUnpaused.current = true;
    } else {
      setEventIndex((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (!isPaused.current && animateWhenUnpaused.current) {
      setEventIndex((prev) => prev + 1);
      animateWhenUnpaused.current = false;
    }
  }, [props.isPaused]);

  return (
    <Root ref={handleRef}>
      {boundingRect && opponentBoundingRect && (
        <CardStackAnimation
          cards={props.cards}
          currentCardIndex={props.currentCardIndex}
          event={event}
          onAnimationComplete={handleAnimationComplete}
          deckBoundingRect={boundingRect}
          opponentBoundingRect={opponentBoundingRect}
        />
      )}
    </Root>
  );
}

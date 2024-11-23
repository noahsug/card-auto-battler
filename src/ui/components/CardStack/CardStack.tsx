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
  'startPlayCard',
  'discardCard',
  'trashCard',
  'shuffle',
  'addTemporaryCard',
  'applyCardEffects',
  'endPlayCard',
]);

interface Props {
  cards: CardState[];
  currentCardIndex: number;
  events: BattleEvent[];
  onAnimationComplete: () => void;
  opponentBoundingRect: DOMRect | null;
  isPaused: boolean;
  isFastForwarding: boolean;
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
  const event: BattleEvent = events.current[eventIndex];

  isPaused.current = props.isPaused && event?.type === 'startPlayCard';

  // console.log(
  //   'CS',
  //   boundingRect?.x,
  //   events.current[eventIndex - 1]?.type,
  //   events.current[eventIndex]?.type,
  //   events.current[eventIndex + 1]?.type,
  // );

  // undo
  useEffect(() => {
    const undoIndex = events.current.findLastIndex((e) => e.type === 'undo');
    if (eventIndex < undoIndex) {
      // console.log('CS undo setEventIndex', undoIndex);
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
    // console.log('CS new event', event?.type);
    visitedEventInfo.current = { eventIndex, event };

    const prevEvent = events.current[eventIndex - 1];
    const nextEvent = events.current[eventIndex + 1];

    if (event?.type === 'shuffle' && nextEvent?.type === 'endPlayCard') {
      // mark the animation as complete early if all we have left to do is shuffle the cards
      onAnimationComplete();
      // console.log('M done shuffle');
    } else if (event?.type === 'endPlayCard') {
      // endPlayCard doesn't have an animation, so we manually move to the next event
      setEventIndex((prev) => prev + 1);
      // check that we haven't already marked the animation as complete due to the shuffle case
      // above
      if (prevEvent?.type !== 'shuffle') {
        // TODO: just splice endPlayCard/applyCardEffects from events.current, rather than do the
        // above check
        onAnimationComplete();
      }
      // console.log('CS endPlayCard');
    } else if (event?.type === 'startPlayCard' && nextEvent?.type === 'applyCardEffects') {
      // mark the animation as complete if all we have left to do is start the play card animation
      // console.log('CS start applyCardEffects');
      if (cardPlayedTimeout.current == null) {
        cardPlayedTimeout.current = setTimeout(() => {
          onAnimationComplete();
          // console.log('CS done applyCardEffects');
          cardPlayedTimeout.current = undefined;
        }, 200);
      }
    } else if (event?.type === 'applyCardEffects') {
      // applyCardEffects doesn't have an animation, so we manually move to the next event
      setEventIndex((prev) => prev + 1);
      // check that we haven't already marked the animation as complete due to the startPlayCard
      // case above
      if (prevEvent?.type !== 'startPlayCard') {
        onAnimationComplete();
      }
    }
  }, [event, eventIndex, isPaused, onAnimationComplete]);

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
          isFastForwarding={props.isFastForwarding}
        />
      )}
    </Root>
  );
}

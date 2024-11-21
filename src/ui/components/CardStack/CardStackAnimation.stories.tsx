import type { Meta, StoryObj } from '@storybook/react';

import { useRef, useState } from 'react';
import { styled } from 'styled-components';
import { BattleEvent, createBattleEvent } from '../../../game/actions/battleEvent';
import { getRandomCards } from '../../../game/utils/cards';
import { CardStackAnimation, Props } from './CardStackAnimation';

const Container = styled.div`
  position: relative;
  height: 150px;
  width: 100px;
`;

function CardStackAnimationTest({
  events,
  undoAfterMs,
  ...props
}: { events: BattleEvent[]; undoAfterMs?: number } & Omit<Props, 'event' | 'onAnimationComplete'>) {
  const [event, setEvent] = useState<BattleEvent | undefined>(events[0]);

  const undoTimeout = useRef<NodeJS.Timeout>();
  if (undoAfterMs != null && undoTimeout.current == null) {
    undoTimeout.current = setTimeout(() => {
      setEvent(createBattleEvent('undo'));
    }, undoAfterMs);
  }

  function onAnimationComplete() {
    events.shift();
    setEvent(events[0]);
  }

  return (
    <Container>
      <CardStackAnimation event={event} onAnimationComplete={onAnimationComplete} {...props} />
    </Container>
  );
}

const meta = {
  title: 'CardStackAnimation',
  component: CardStackAnimationTest,
  args: {
    cards: getRandomCards(3),
    currentCardIndex: 0,
    deckBoundingRect: new DOMRect(0, 0, 0, 0),
    opponentBoundingRect: new DOMRect(100, -100, 0, 0),
    isFastForwarding: false,
  },
} satisfies Meta<typeof CardStackAnimationTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TakeTurn: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createBattleEvent('startPlayCard', 0),
      createBattleEvent('discardCard', 0),
      createBattleEvent('startPlayCard', 1),
      createBattleEvent('trashCard', 1),
      createBattleEvent('startPlayCard', 2),
      createBattleEvent('discardCard', 2),
      createBattleEvent('shuffle'),
    ],
  },
};

export const UndoPlayCard: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createBattleEvent('startPlayCard', 0),
      createBattleEvent('discardCard', 0),
      createBattleEvent('undo'),
    ],
  },
};

export const UndoTrashCard: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createBattleEvent('startPlayCard', 0),
      createBattleEvent('trashCard', 0),
      createBattleEvent('undo'),
    ],
  },
};

export const UndoMidPlayCard: Story = {
  args: {
    events: [createBattleEvent('startBattle'), createBattleEvent('startPlayCard', 0)],
    undoAfterMs: 1600,
  },
};

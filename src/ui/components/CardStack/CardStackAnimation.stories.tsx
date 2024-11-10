import type { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';
import { styled } from 'styled-components';
import { BattleEvent, createBattleEvent, createCardEvent } from '../../../game/actions/battleEvent';
import { getRandomCards } from '../../../game/utils/cards';
import { CardStackAnimation, Props } from './CardStackAnimation2';

const Container = styled.div`
  position: relative;
  height: 150px;
  width: 100px;
`;

function CardStackAnimationTest({
  events,
  ...props
}: { events: BattleEvent[] } & Omit<Props, 'event' | 'onAnimationComplete'>) {
  const [event, setEvent] = useState<BattleEvent | undefined>(events[0]);

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
} satisfies Meta<typeof CardStackAnimationTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    events: [
      createBattleEvent('startBattle'),
      createCardEvent('playCard', 0),
      createCardEvent('discardCard', 0),
      createCardEvent('playCard', 1),
      createCardEvent('trashCard', 1),
      createCardEvent('playCard', 2),
      createCardEvent('discardCard', 2),
      createBattleEvent('shuffle'),
    ],
    cards: getRandomCards(3),
    currentCardIndex: 0,
    deckRect: new DOMRect(0, 0, 0, 0),
    opponentRect: new DOMRect(100, -100, 0, 0),
  },
};

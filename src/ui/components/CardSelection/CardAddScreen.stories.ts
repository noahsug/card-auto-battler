import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { cardsByName } from '../../../content/cards';
import { relicsByName } from '../../../content/relics';
import { getCardAddOptions } from '../../../game/actions';
import { CardState, createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { CardAddScreen } from './CardAddScreen';

const meta = {
  title: 'CardAddScreen',
  component: CardAddScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof CardAddScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: (() => {
    const game = createGameState();
    game.user.relics = getRandomRelics(3);
    const cards = getCardAddOptions(game);
    return { game, cards };
  })(),
};

export const MonkRelic: Story = {
  args: (() => {
    const game = createGameState();
    game.user.relics.push(relicsByName.monk);
    let cards: CardState[] = [];
    for (let i = 0; i < 100; i++) {
      cards = getCardAddOptions(game);
      if (cards.some((card) => card.name === 'Punch (Monk)')) break;
    }
    return { game, cards };
  })(),
};

export const AllCards: Story = {
  args: {
    game: createGameState(),
    cards: Object.values(cardsByName),
  },
};

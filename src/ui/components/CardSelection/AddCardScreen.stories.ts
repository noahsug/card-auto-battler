import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { cardsByName } from '../../../content/cards';
import { relicsByName } from '../../../content/relics';
import { getAddCardsOptions } from '../../../game/actions';
import { CardState, createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { AddCardScreen } from './AddCardScreen';

const meta = {
  title: 'AddCardsScreen',
  component: AddCardScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof AddCardScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstTurn: Story = {
  args: (() => {
    const game = createGameState();
    const cards = getAddCardsOptions(game);
    return { game, cards };
  })(),
};

export const LaterTurns: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = 1;
    game.user.relics = getRandomRelics(3);
    const cards = getAddCardsOptions(game);
    return { game, cards };
  })(),
};

export const MonkRelic: Story = {
  args: (() => {
    const game = createGameState();
    game.user.relics.push(relicsByName.monk);
    let cards: CardState[] = [];
    for (let i = 0; i < 100; i++) {
      cards = getAddCardsOptions(game);
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

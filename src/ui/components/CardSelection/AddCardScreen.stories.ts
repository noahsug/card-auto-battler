import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { cardsByType, enemyCardsByType } from '../../../content/cards';
import { relicsByType } from '../../../content/relics';
import { getAddCardOptions } from '../../../game/actions';
import { CardState, createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../testing/utils';
import { AddCardsScreen } from './AddCardsScreen';

const meta = {
  title: 'AddCardsScreen',
  component: AddCardsScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof AddCardsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstTurn: Story = {
  args: (() => {
    const game = createGameState();
    const cards = getAddCardOptions(game);
    return { game, cards };
  })(),
};

export const LaterTurns: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = 1;
    game.user.relics = getRandomRelics(3);
    const cards = getAddCardOptions(game);
    return { game, cards };
  })(),
};

export const MonkRelic: Story = {
  args: (() => {
    const game = createGameState();
    game.user.relics.push(relicsByType.monk);
    let cards: CardState[] = [];
    for (let i = 0; i < 100; i++) {
      cards = getAddCardOptions(game);
      if (cards.some((card) => card.name === 'Punch (Monk)')) break;
    }
    return { game, cards };
  })(),
};

export const AllCards: Story = {
  args: {
    game: createGameState(),
    cards: Object.values(cardsByType),
  },
};

export const EnemyCards: Story = {
  args: {
    game: createGameState(),
    cards: Object.values(enemyCardsByType),
  },
};

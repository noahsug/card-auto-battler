import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { createGameState } from '../../../game/gameState';
import { getRandomRelics } from '../../../game/utils/relics';
import { CardChainScreen } from './CardChainScreen';
import { getRandomCards } from '../../../game/utils/cards';

const meta = {
  title: 'CardChainScreen',
  component: CardChainScreen,
  args: {
    onViewDeck: fn,
    onCardsSelected: fn,
  },
} satisfies Meta<typeof CardChainScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

const game = createGameState();

export const Primary: Story = {
  args: {
    game,
  },
};

export const HasExistingChain: Story = {
  args: (() => {
    const game = createGameState();
    game.user.cards = getRandomCards(6);
    const [fromCard, toCard] = game.user.cards.slice(1, 3);
    fromCard.chain.toId = toCard.acquiredId;
    toCard.chain.fromId = fromCard.acquiredId;
    return { game };
  })(),
};

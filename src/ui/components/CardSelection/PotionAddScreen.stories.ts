import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { potionByName } from '../../../content/cards';
import { getPotionAddOptions } from '../../../game/actions';
import { createGameState } from '../../../game/gameState';
import { PotionAddScreen } from './PotionAddScreen';

const meta = {
  title: 'PotionAddScreen',
  component: PotionAddScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof PotionAddScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: (() => {
    const game = createGameState();
    const cards = getPotionAddOptions(game);
    return { game, cards };
  })(),
};

export const AllPotions: Story = {
  args: {
    game: createGameState(),
    cards: Object.values(potionByName),
  },
};

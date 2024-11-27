import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { potionByName } from '../../../content/cards';
import { getAddPotionOptions } from '../../../game/actions';
import { createGameState } from '../../../game/gameState';
import { AddPotionsScreen } from './AddPotionsScreen';

const meta = {
  title: 'PotionAddScreen',
  component: AddPotionsScreen,
  args: {
    onViewDeck: fn(),
    onCardsSelected: fn(),
  },
} satisfies Meta<typeof AddPotionsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: (() => {
    const game = createGameState();
    const cards = getAddPotionOptions(game);
    return { game, cards };
  })(),
};

export const AllPotions: Story = {
  args: {
    game: createGameState(),
    cards: Object.values(potionByName),
  },
};

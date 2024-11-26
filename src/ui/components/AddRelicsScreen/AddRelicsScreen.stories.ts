import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { relicsByName } from '../../../content/relics';
import { getRelicAddOptions } from '../../../game/actions';
import { createGameState } from '../../../game/gameState';
import { AddRelicsScreen } from './AddRelicsScreen';

const meta = {
  title: 'AddRelicsScreen',
  component: AddRelicsScreen,
  args: {
    onViewDeck: fn(),
    onRelicSelected: fn(),
  },
} satisfies Meta<typeof AddRelicsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: (() => {
    const game = createGameState();
    const relics = getRelicAddOptions(game);
    return { game, relics };
  })(),
};

export const AllRelics: Story = {
  args: {
    game: createGameState(),
    relics: Object.values(relicsByName),
  },
};

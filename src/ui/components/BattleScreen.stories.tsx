import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { cardsByName } from '../../content/cards';
import { relicsByName } from '../../content/relics';
import { createGameState, GameState, statusEffectNames } from '../../game/gameState';
import { getRandomCards } from '../../game/utils/cards';
import { useGameState } from '../hooks/useGameState';
import { BattleScreen } from './BattleScreen';

function BattleScreenTest({ game: initialGameState }: { game: GameState }) {
  const { game, actions, undoManager } = useGameState(initialGameState);

  return (
    <BattleScreen
      game={game}
      {...actions}
      {...undoManager}
      onBattleOver={fn()}
      onViewDeck={fn()}
    ></BattleScreen>
  );
}

const meta = {
  title: 'BattleScreen',
  component: BattleScreenTest,
} satisfies Meta<typeof BattleScreenTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FewCards: Story = {
  args: {
    game: createGameState(),
  },
};

export const ManyCards: Story = {
  args: (() => {
    const game = createGameState();
    game.user.cards = getRandomCards(20);
    return { game };
  })(),
};

export const IsDead: Story = {
  args: (() => {
    const game = createGameState();
    game.enemy.health = 0;
    return { game };
  })(),
};

export const StatusEffectsAndRelics: Story = {
  args: (() => {
    const game = createGameState();
    statusEffectNames.forEach((effectName) => {
      game.enemy[effectName] = 3;
    });
    game.user.strength = -5;
    game.user.relics = Object.values(relicsByName);
    return { game };
  })(),
};

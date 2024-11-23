import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { relicsByName } from '../../content/relics';
import { MAX_LOSSES, MAX_WINS } from '../../game/constants';
import { createGameState, GameState, statusEffectNames } from '../../game/gameState';
import { getRandomCards } from '../../game/utils/cards';
import { useGameState } from '../hooks/useGameState';
import { BattleScreen } from './BattleScreen';

function BattleScreenTest({ game: initialGameState }: { game: GameState }) {
  const { game, actions, setGameState } = useGameState(initialGameState);

  return (
    <BattleScreen
      game={game}
      setGameState={setGameState}
      {...actions}
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

export const Boss: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = MAX_WINS - 1;
    return { game };
  })(),
};

export const OneLife: Story = {
  args: (() => {
    const game = createGameState();
    game.losses = MAX_LOSSES - 1;
    return { game };
  })(),
};

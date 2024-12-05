import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { enemiesByType } from '../../content/enemies';
import { EnemyType } from '../../content/enemies/enemies';
import { relicsByType } from '../../content/relics';
import { startBattle } from '../../game/actions';
import { MAX_WINS } from '../../game/constants';
import { createGameState, GameState, statusEffectTypes } from '../../game/gameState';
import { getRandomCards } from '../../testing/utils';
import { useGameState } from '../hooks/useGameState';
import { BattleScreen } from './BattleScreen';

function BattleScreenTest({ game: initialGameState }: { game: GameState }) {
  const { game, actions, select, setGameState } = useGameState(initialGameState);

  return (
    <BattleScreen
      game={game}
      setGameState={setGameState}
      select={select}
      {...actions}
      onBattleOver={fn()}
      onViewDeck={fn()}
      hasOverlay={false}
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

export const EnemyIsDead: Story = {
  args: (() => {
    const game = createGameState();
    game.enemy.health = 0;
    return { game };
  })(),
};

export const StatusEffectsAndRelics: Story = {
  args: (() => {
    const game = createGameState();
    statusEffectTypes.forEach((effectType) => {
      game.enemy[effectType] = 3;
    });
    game.user.strength = -5;
    game.user.relics = Object.values(relicsByType);
    return { game };
  })(),
};

export const MidGame: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = Math.round(MAX_WINS / 2) - 1;
    startBattle(game);
    return { game };
  })(),
};

export const LateGame: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = MAX_WINS - 2;
    startBattle(game);
    return { game };
  })(),
};

export const Boss: Story = {
  args: (() => {
    const game = createGameState();
    game.wins = MAX_WINS - 1;
    startBattle(game);
    return { game };
  })(),
};

function fightEnemy(enemyType: EnemyType, isEarlyBattleRound: boolean): Story {
  return {
    args: (() => {
      const game = createGameState();
      const enemyInfo = Object.entries(enemiesByType).find(([t]) => t === enemyType)![1];
      game.wins = isEarlyBattleRound ? enemyInfo.battleRange[0] : enemyInfo.battleRange[1];
      game.enemyOrder[game.wins] = enemyType;
      startBattle(game);
      return { game };
    })(),
  };
}

export const Punchy: Story = fightEnemy('punchy', true);
export const Punchy2: Story = fightEnemy('punchy', false);

export const GreenMonster: Story = fightEnemy('greenMonster', true);
export const GreenMonster2: Story = fightEnemy('greenMonster', false);

export const ArmoredLizard: Story = fightEnemy('armoredLizard', true);
export const ArmoredLizard2: Story = fightEnemy('armoredLizard', false);

export const CoolBird: Story = fightEnemy('coolBird', true);
export const CoolBird2: Story = fightEnemy('coolBird', false);

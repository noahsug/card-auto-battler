import { produce } from 'immer';
import { useMemo, useState } from 'react';

import * as actions from '../../game/actions';
import { createGameState, GameState } from '../../game/gameState';
import { getResolvablePromise } from '../../utils/promise';
import { Tail } from '../../utils/types';

type BoundActions = {
  [K in keyof typeof actions]: (
    ...args: Tail<Parameters<(typeof actions)[K]>>
  ) => Promise<ReturnType<(typeof actions)[K]>>;
};

export type UndoPlayedCardAction = BoundActions['undoPlayedCard'];
export type StartTurnAction = BoundActions['startTurn'];
export type PlayCardAction = BoundActions['playCard'];
export type EndTurnAction = BoundActions['endTurn'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (state: GameState, ...args: any[]) => any;

export function useGameState(initialGameState: GameState = createGameState()) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const boundActions = useMemo(() => {
    const actionEntries = Object.entries(actions) as [keyof typeof actions, Action][];
    return actionEntries.reduce((acc, [name, action]) => {
      const { promise, resolve } = getResolvablePromise<ReturnType<Action>>();
      acc[name] = (...args: Tail<Parameters<Action>>) => {
        setGameState((gameState) => {
          return produce(gameState, (draft) => {
            resolve(action(draft, ...args));
          });
        });
        return promise;
      };
      return acc;
    }, {} as BoundActions);
    // TODO: remove this dep after removing the promise resolve logic above, instead of returning a
    // value from setState, have gameState hold the battleEvents (and disable battle events
    // entirely in analysis mode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  return { game: gameState, actions: boundActions };
}

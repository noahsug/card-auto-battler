import { produce } from 'immer';
import { useMemo, useState } from 'react';

import * as actions from '../../game/actions';
import { createGameState, GameState } from '../../game/gameState';
import { Tail } from '../../utils/types';
import { getResolvablePromise } from '../../utils/promise';

type BoundActions = {
  [K in keyof typeof actions]: (
    ...args: Tail<Parameters<(typeof actions)[K]>>
  ) => Promise<ReturnType<(typeof actions)[K]>>;
};

export type AddCards = BoundActions['addCards'];
export type PlayCard = BoundActions['playCard'];
export type EndBattle = BoundActions['endBattle'];
export type ResetGame = BoundActions['resetGame'];

export type CanUndo = () => boolean;
export type ClearUndo = () => void;
export type Undo = () => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (state: GameState, ...args: any[]) => any;

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createGameState());
  const [past, setPast] = useState<GameState[]>([]);

  const boundActions = useMemo(() => {
    const actionEntries = Object.entries(actions) as [keyof typeof actions, Action][];
    return actionEntries.reduce((acc, [name, action]) => {
      const { promise, resolve } = getResolvablePromise<ReturnType<Action>>();
      acc[name] = (...args: Tail<Parameters<Action>>) => {
        setGameState((gameState) => {
          setPast((past) => {
            return [...past, gameState];
          });
          return produce(gameState, (draft) => {
            resolve(action(draft, ...args));
          });
        });
        return promise;
      };
      return acc;
    }, {} as BoundActions);
    // without this dep, actions somehow return memoized results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const canUndo = () => {
    return past.length > 0;
  };
  const clearUndo = () => {
    setPast(() => {
      return [];
    });
  };
  const undo = () => {
    const nextGameState = past[past.length - 1];
    setGameState(nextGameState);
    setPast((past) => past.slice(0, -1));
  };

  const undoManager = { canUndo, clearUndo, undo };

  return { game: gameState, actions: boundActions, undoManager };
}

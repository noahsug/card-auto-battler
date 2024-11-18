import { produce } from 'immer';
import { useCallback, useMemo, useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';

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
export type StartTurn = BoundActions['startTurn'];
export type PlayCard = BoundActions['playCard'];
export type EndTurn = BoundActions['endTurn'];
export type EndBattle = BoundActions['endBattle'];
export type ResetGame = BoundActions['resetGame'];

export type CanUndo = () => boolean;
export type ClearUndo = () => void;
export type Undo = () => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (state: GameState, ...args: any[]) => any;

export function useGameState(initialGameState: GameState = createGameState()) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [undoHistory, setUndoHistory] = useState<GameState[]>([]);

  const boundActions = useMemo(() => {
    const actionEntries = Object.entries(actions) as [keyof typeof actions, Action][];
    return actionEntries.reduce((acc, [name, action]) => {
      const { promise, resolve } = getResolvablePromise<ReturnType<Action>>();
      acc[name] = (...args: Tail<Parameters<Action>>) => {
        // only allow undoing to a previous startTurn event
        if (name === 'startTurn') {
          // setUndoHistory((prev) => [...prev, gameState]);
          setUndoHistory((prev) => {
            return [...prev, cloneDeep(gameState)];
          });
        }
        setGameState((gameState) => {
          return produce(gameState, (draft) => {
            resolve(action(draft, ...args));
          });
        });
        return promise;
      };
      return acc;
    }, {} as BoundActions);
    // TODO: we should ideally remove this dep
  }, [gameState]);

  const canUndo = useCallback(() => {
    return undoHistory.length > 0;
  }, [undoHistory.length]);

  const clearUndo = useCallback(() => {
    setUndoHistory([]);
  }, []);

  const undo = useCallback(() => {
    setUndoHistory((prev) => prev.slice(0, -1));
    setGameState(undoHistory[undoHistory.length - 1]);
  }, [undoHistory]);

  const undoManager = useMemo(
    () => ({
      canUndo,
      clearUndo,
      undo,
    }),
    [canUndo, clearUndo, undo],
  );

  return { game: gameState, actions: boundActions, undoManager };
}

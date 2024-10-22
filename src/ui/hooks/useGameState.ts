import { produce } from 'immer';
import { useMemo, useState } from 'react';

import * as actions from '../../game/actions';
import { createGameState, GameState } from '../../game/gameState';
import { Tail } from '../../utils/types';

type BoundActions = {
  [K in keyof typeof actions]: (
    ...args: Tail<Parameters<(typeof actions)[K]>>
  ) => ReturnType<(typeof actions)[K]>;
};

export type PlayCard = BoundActions['playCard'];
export type AddCards = BoundActions['addCards'];
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
      acc[name] = (...args: Tail<Parameters<Action>>) => {
        let returnValue: ReturnType<Action>;
        const nextGameState = produce(gameState, (draft) => {
          returnValue = action(draft, ...args);
        });
        setGameState(nextGameState);
        setPast((past) => [...past, gameState]);
        return returnValue;
      };
      return acc;
    }, {} as BoundActions);
  }, [gameState]);

  const canUndo = () => past.length > 0;
  const clearUndo = () => setPast([]);
  const undo = () => {
    const nextGameState = past[past.length - 1];
    setGameState(nextGameState);
    setPast((past) => past.slice(0, -1));
  };

  const undoManager = { canUndo, clearUndo, undo };

  return { game: gameState, actions: boundActions, undoManager };
}

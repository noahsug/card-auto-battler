/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, PropsWithChildren, useMemo, useState } from 'react';
import { produce } from 'immer';

import { GameState, createNewGameState } from '../../game/gameState';
import * as actions from '../../game/actions';
import { Tail, Value, Writable } from '../../utils/types';

type StatefulActions = {
  [K in keyof typeof actions]: (...args: Tail<Parameters<(typeof actions)[K]>>) => void;
};

interface GameStateManager {
  gameState: GameState;
  dispatch: <T extends Value<typeof actions>>(action: T, ...args: Tail<Parameters<T>>) => void;
  canUndo: () => boolean;
  clearPast: () => void;
  undo: () => void;
}

const GameStateManagerContext = createContext<GameStateManager>({
  gameState: createNewGameState(),
  dispatch: () => {},
  canUndo: () => false,
  clearPast() {},
  undo() {},
});

export default function GameStateProvider({ children }: PropsWithChildren) {
  const [gameState, setGameState] = useState<GameState>(createNewGameState());
  const [past, setPast] = useState<GameState[]>([]);

  const dispatch: GameStateManager['dispatch'] = (action, ...args) => {
    const nextGameState = produce(gameState, (draft) => action(draft, ...args));
    setGameState(nextGameState);
    setPast((past) => [...past, gameState]);
  };

  function canUndo() {
    return past.length > 0;
  }

  function clearPast() {
    setPast([]);
  }

  function undo() {
    const nextGameState = past[past.length - 1];
    setGameState(nextGameState);
    setPast((past) => past.slice(0, -1));

    console.log('undo', past, nextGameState);
  }

  const gameStateManager = {
    gameState,
    dispatch,
    canUndo,
    clearPast,
    undo,
  };

  return (
    <GameStateManagerContext.Provider value={gameStateManager}>
      {children}
    </GameStateManagerContext.Provider>
  );
}

export function useGameState() {
  const { gameState } = useContext(GameStateManagerContext);
  return gameState;
}

export function useActions(): StatefulActions {
  const { dispatch } = useContext(GameStateManagerContext);

  return useMemo(() => {
    const statefulActions = {} as Writable<StatefulActions>;
    for (const name in actions) {
      const key = name as keyof StatefulActions;
      statefulActions[key] = dispatch.bind(null, actions[key]);
    }

    return statefulActions;
  }, [dispatch]);
}

export function useUndo() {
  const { undo, canUndo } = useContext(GameStateManagerContext);
  return {
    undo,
    get canUndo() {
      return canUndo();
    },
  };
}

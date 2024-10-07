import { createContext, useContext, PropsWithChildren, useMemo, useState, useRef } from 'react';
import { produce } from 'immer';

import { GameState } from '../../game/gameState';
import * as actions from '../../game/actions';
import { Tail, Value, Writable } from '../../utils/types';

type StatefulActions = {
  [K in keyof typeof actions]: (
    ...args: Tail<Parameters<(typeof actions)[K]>>
  ) => ReturnType<(typeof actions)[K]>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (state: GameState, ...args: any[]) => void;

interface GameStateManager {
  gameState: GameState;
  dispatch: <T extends Value<typeof actions>>(action: T, ...args: Tail<Parameters<T>>) => void;
  canUndo: () => boolean;
  clearUndo: () => void;
  undo: () => void;
}

const GameStateManagerContext = createContext<GameStateManager | null>(null);

interface Props extends PropsWithChildren {
  gameState: GameState;
}

export function GameStateProvider({ children, gameState: initialGameState }: Props) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [past, setPast] = useState<GameState[]>([]);

  const dispatch: GameStateManager['dispatch'] = (action: Action, ...args) => {
    let result: unknown;
    const nextGameState = produce(gameState, (draft) => {
      result = action(draft, ...args);
    });
    setGameState(nextGameState);
    setPast((past) => [...past, gameState]);
    return result;
  };

  function canUndo() {
    return past.length > 0;
  }

  function clearUndo() {
    setPast([]);
  }

  function undo() {
    const nextGameState = past[past.length - 1];
    setGameState(nextGameState);
    setPast((past) => past.slice(0, -1));
  }

  const gameStateManager = {
    gameState,
    dispatch,
    canUndo,
    clearUndo,
    undo,
  };

  return (
    <GameStateManagerContext.Provider value={gameStateManager}>
      {children}
    </GameStateManagerContext.Provider>
  );
}

function useContextOrFail<T>(context: React.Context<T>) {
  const contextValue = useContext(context);
  if (contextValue == null) {
    throw new Error('no Provider found for context');
  }
  return contextValue;
}

export function useGameState() {
  const { gameState } = useContextOrFail(GameStateManagerContext);
  return gameState;
}

export function useActions(): StatefulActions {
  const { dispatch } = useContextOrFail(GameStateManagerContext);

  return useMemo(() => {
    const statefulActions = {} as Writable<StatefulActions>;
    for (const name in actions) {
      const key = name as keyof StatefulActions;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      statefulActions[key] = dispatch.bind(null, actions[key]) as any;
    }
    return statefulActions;
  }, [dispatch]);
}

export function useUndo() {
  const { undo, canUndo, clearUndo } = useContextOrFail(GameStateManagerContext);
  return useMemo(
    () => ({
      undo,
      get canUndo() {
        return canUndo();
      },
      clearUndo,
    }),
    [undo, canUndo, clearUndo],
  );
}

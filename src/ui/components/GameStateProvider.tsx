/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, PropsWithChildren, Dispatch, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';

import { GameState, createNewGameState } from '../../game/gameState';
import * as actions from '../../game/actions';
import { Tail, Writable } from '../../utils/types';

type ReduceFn = (gameState: GameState) => void;

type Action = (gameState: GameState, ...args: any[]) => void;
type StatefulActions = {
  [K in keyof typeof actions]: (...args: Tail<Parameters<(typeof actions)[K]>>) => void;
};

const initialGameState = createNewGameState();

const GameStateContext = createContext(initialGameState);
const GameStateDispatchContext = createContext((() => null) as Dispatch<ReduceFn>);

export default function GameStateProvider({ children }: PropsWithChildren) {
  const gameReducer = (gameState: GameState, reduceFn: ReduceFn) => reduceFn(gameState);

  const [gameState, dispatch] = useImmerReducer(gameReducer, initialGameState);

  return (
    <GameStateContext.Provider value={gameState}>
      <GameStateDispatchContext.Provider value={dispatch}>
        {children}
      </GameStateDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  return useContext(GameStateContext);
}

// Converts an action from `action(state, ...args)` -> `action(...args)`
function getStatefulAction(action: Action, dispatch: (reduceFn: ReduceFn) => void) {
  return (...args: any[]) => {
    const reduceFn = (gameState: GameState) => action(gameState, ...args);
    dispatch(reduceFn);
  };
}

export function useActions(): StatefulActions {
  const dispatch = useContext(GameStateDispatchContext);

  return useMemo(() => {
    const statefulActions = {} as Writable<StatefulActions>;
    for (const name in actions) {
      const action = actions[name as keyof StatefulActions];
      statefulActions[name as keyof StatefulActions] = getStatefulAction(action, dispatch);
    }

    return statefulActions;
  }, [dispatch]);
}

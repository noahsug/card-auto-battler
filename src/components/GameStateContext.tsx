import { createContext, useContext, PropsWithChildren, Dispatch } from 'react';
import { useImmerReducer } from 'use-immer';

import { GameState, createInitialGameState } from '../gameState';
import * as reduceFnActions from '../gameState/actions';
import { Writable } from '../utils/types';

type ReduceFn = (gameState: GameState) => void;
type GetReduceFn = (...args: any[]) => ReduceFn;
type Actions = {
  [K in keyof typeof reduceFnActions]: (...args: Parameters<(typeof reduceFnActions)[K]>) => void;
};

const initialGameState = createInitialGameState();

const GameStateContext = createContext(initialGameState);
const GameStateDispatchContext = createContext((() => null) as Dispatch<ReduceFn>);

export function GameStateProvider({ children }: PropsWithChildren) {
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

function wrapWithDispatch(
  getReduceFn: GetReduceFn,
  dispatch: (reduceFn: ReduceFn) => void,
): (...args: any[]) => void {
  return (...args: any[]) => dispatch(getReduceFn(...args));
}

export function useActions(): Actions {
  const dispatch = useContext(GameStateDispatchContext);

  const actions = {} as Writable<Actions>;
  for (const name in reduceFnActions) {
    const action = reduceFnActions[name as keyof Actions];
    actions[name as keyof Actions] = wrapWithDispatch(action, dispatch);
  }

  return actions;
}

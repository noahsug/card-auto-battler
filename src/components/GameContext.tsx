import { createContext, useContext, PropsWithChildren, Dispatch } from 'react';
import { useImmerReducer } from 'use-immer';

import { Game, createInitialGame } from '../state';
import * as reduceFnActions from '../state/actions';
import { Writable } from '../utils/types';

type ReduceFn = (game: Game) => void;
type GetReduceFn = (...args: any[]) => ReduceFn;
type Actions = {
  [K in keyof typeof reduceFnActions]: (...args: Parameters<(typeof reduceFnActions)[K]>) => void;
};

const initialGame = createInitialGame();

const GameContext = createContext(initialGame);
const GameDispatchContext = createContext((() => null) as Dispatch<ReduceFn>);

export function GameProvider({ children }: PropsWithChildren) {
  const gameReducer = (game: Game, reduceFn: ReduceFn) => reduceFn(game);

  const [game, dispatch] = useImmerReducer(gameReducer, initialGame);

  return (
    <GameContext.Provider value={game}>
      <GameDispatchContext.Provider value={dispatch}>{children}</GameDispatchContext.Provider>
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

function wrapWithDispatch(
  getReduceFn: GetReduceFn,
  dispatch: (reduceFn: ReduceFn) => void,
): (...args: any[]) => void {
  return (...args: any[]) => dispatch(getReduceFn(...args));
}

export function useActions(): Actions {
  const dispatch = useContext(GameDispatchContext);

  const actions = {} as Writable<Actions>;
  for (const name in reduceFnActions) {
    const action = reduceFnActions[name as keyof Actions];
    actions[name as keyof Actions] = wrapWithDispatch(action, dispatch);
  }

  return actions;
}

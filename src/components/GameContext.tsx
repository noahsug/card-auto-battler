import { createContext, useContext, PropsWithChildren, Dispatch } from 'react';
import { useImmerReducer } from 'use-immer';

import { Game, createInitialGame } from '../state/game';
import * as reduceFnActions from '../state/actions';
import { Writeable } from '../utils/types';

type ReduceFn = (game: Game) => void;
type GetReduceFn<A = never> = (...args: A[]) => ReduceFn;
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

export function useGame(selector: (game: Game) => any = (game) => game) {
  return selector(useContext(GameContext));
}

function wrapWithDispatch<A>(
  getReduceFn: GetReduceFn<A>,
  dispatch: (reduceFn: ReduceFn) => void,
): (...args: A[]) => void {
  return (...args: A[]) => dispatch(getReduceFn(...args));
}

export function useActions(): Actions {
  const dispatch = useContext(GameDispatchContext);

  const actions = {} as Writeable<Actions>;
  for (const name in reduceFnActions) {
    const action = reduceFnActions[name as keyof Actions];
    actions[name as keyof Actions] = wrapWithDispatch(action, dispatch);
  }

  return actions;
}

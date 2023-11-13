import { createContext, useContext, PropsWithChildren, Dispatch } from 'react';
import { useImmerReducer } from 'use-immer';

import { Game, createInitialGame } from '../state/game';
import { gameReducer } from '../state/actions';

const initialGame = createInitialGame();

const GameContext = createContext(initialGame);
const GameDispatchContext = createContext((() => null) as Dispatch<any>);

export function GameProvider({ children }: PropsWithChildren) {
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

export function useGameDispatch() {
  return useContext(GameDispatchContext);
}

import { Game } from './game';

export function gameReducer(game: Game, action: any) {
  switch (action.type) {
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

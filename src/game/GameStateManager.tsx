// import * as actions from './actions';
// import ActionQueue from './ActionQueue';

// class GameState() {
//   const { createNewGameState, setBattle, addStarterDeck, drawCards } = actions;

//   let gameState = createNewGameState();
//   gameState = setBattle(gameState);
//   gameState = addStarterDeck(gameState);
//   gameState = drawCards(gameState);
//   return gameState;
// }

// export default function createNewGame() {
//   const { queue, runNext, undo } = createActionQueue();

//   const state = createNewGameState();

//   function dequeue() {}

//   return {
//     state,
//     actions,
//     queueAction: enqueue,
//     runNextAction() {
//       const nextState = dequeue();
//       if (nextState) {
//         this.state = nextState;
//       }
//     },
//     undo() {
//       const prevGame = undo();
//       if (prevGame) this.state = prevGame.state;
//       return prevGame;
//     },
//   };
// }

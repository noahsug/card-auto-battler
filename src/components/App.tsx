import './App.css';
import { GameProvider } from './GameContext';
import { USER_INDEX, OPPONENT_INDEX } from '../state/game';
import Player from './Player';

export default function App() {
  return (
    <div className="App">
      <GameProvider>
        <Player playerIndex={USER_INDEX} />
        <div className="App-divider" />
        <Player playerIndex={OPPONENT_INDEX} />
      </GameProvider>
    </div>
  );
}

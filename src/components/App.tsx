import './App.css';
import { GameProvider } from './GameContext';
import Player from './Player';

export default function App() {
  return (
    <div className="App">
      <GameProvider>
        <Player isOpponent={true} />
        <div className="App-divider" />
        <Player isOpponent={false} />
      </GameProvider>
    </div>
  );
}

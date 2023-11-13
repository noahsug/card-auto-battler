import './App.css';

import { GameProvider } from './GameContext';
import BattleScreen from './BattleScreen';

export default function App() {
  return (
    <div className="App">
      <GameProvider>
        <BattleScreen />
      </GameProvider>
    </div>
  );
}

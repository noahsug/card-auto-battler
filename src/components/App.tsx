import './App.css';

import { GameProvider } from './GameContext';
import BattleScreen from './BattleScreen';
import InputTracker from './InputTracker';

export default function App() {
  return (
    <div className="App">
      <GameProvider>
        <InputTracker />
        <BattleScreen />
      </GameProvider>
    </div>
  );
}

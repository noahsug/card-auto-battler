import './App.css';

import { GameProvider } from './GameContext';
import InputTracker from './InputTracker';
import ScreenManager from './ScreenManager';

export default function App() {
  return (
    <div className="App">
      <GameProvider>
        <InputTracker />
        <ScreenManager />
      </GameProvider>
    </div>
  );
}

import './App.css';

import { GameProvider } from './GameContext';
import InputTracker from './InputTracker';
import ScreenContainer from './ScreenContainer';

export default function App() {
  return (
    <div className="App">
      <GameProvider>
        <InputTracker />
        <ScreenContainer />
      </GameProvider>
    </div>
  );
}

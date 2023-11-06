import { useState } from 'react';
import './App.css';
import Player from './Player';

import { createGameState, getP1, getP2 } from '../state/game';

export default function App() {
  const [state] = useState(createGameState());
  const p1 = getP1(state);
  const p2 = getP2(state);

  return (
    <div className="App">
      <Player player={p1} />
      <div className="App-divider" />
      <Player player={p2} />
    </div>
  );
}

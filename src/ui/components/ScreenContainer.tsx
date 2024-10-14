import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { GameState } from '../../game/gameState';
import { getBattleWinner, isGameOver } from '../../game/utils';
import { BattleResultOverlay } from './BattleResultOverlay';
import { BattleScreen } from './BattleScreen';
import { useActions, useGameState, useUndo } from './GameStateContext';
import { OverlayBackground } from './shared/OverlayBackground';
import { StartScreen } from './StartScreen';

type ScreenType = 'start' | 'cardSelection' | 'battle';
type OverlayType = 'battleResult' | 'none';

export const ScreenContainerRoot = styled.div`
  max-width: 100vh;
  margin: auto;
`;

export function ScreenContainer() {
  const { endBattle, resetGame } = useActions();
  const { clearUndo } = useUndo();

  const game = useGameState();

  // frozen game state from last battle, ensures battle screen doesn't update after battle is over
  const lastBattleGameState = useRef<GameState>();
  const battleGameState = lastBattleGameState.current || game;

  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');
  const [wonLastBattle, setWonLastBattle] = useState(false);

  const handleNextBattle = useCallback(() => {
    lastBattleGameState.current = undefined;
    if (isGameOver(game)) {
      resetGame();
    }
    clearUndo();
    setScreen('battle');
    setOverlay('none');
  }, [clearUndo, game, resetGame]);

  const handleBattleOver = useCallback(() => {
    lastBattleGameState.current = game;
    setWonLastBattle(getBattleWinner(game) === 'user');
    endBattle();
    setOverlay('battleResult');
  }, [game, endBattle]);

  return (
    <ScreenContainerRoot>
      {screen === 'start' && <StartScreen onContinue={handleNextBattle}></StartScreen>}

      {screen === 'battle' && (
        <BattleScreen
          game={battleGameState}
          onBattleOver={handleBattleOver}
          hasOverlay={overlay !== 'none'}
        ></BattleScreen>
      )}

      {overlay !== 'none' && (
        <OverlayBackground>
          {overlay === 'battleResult' && (
            <BattleResultOverlay
              game={game}
              wonLastBattle={wonLastBattle}
              onContinue={handleNextBattle}
            ></BattleResultOverlay>
          )}
        </OverlayBackground>
      )}
    </ScreenContainerRoot>
  );
}

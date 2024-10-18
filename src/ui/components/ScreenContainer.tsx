import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { CardState, GameState } from '../../game/gameState';
import { getBattleWinner, isGameOver } from '../../game/utils/selectors';
import { getRandomCards } from '../../game/utils/getRandomCards';
import { BattleResultOverlay } from './BattleResultOverlay';
import { BattleScreen } from './BattleScreen';
import { useActions, useGameState, useUndo } from './GameStateContext';
import { OverlayBackground } from './shared/OverlayBackground';
import { StartScreen } from './StartScreen';
import { CardSelectionScreen } from './CardSelectionScreen';
import { NUM_CARD_SELECTION_OPTIONS } from '../../game/constants';
import { ViewDeckOverlay } from './ViewDeckOverlay';

type ScreenType = 'start' | 'cardSelection' | 'battle';
type OverlayType = 'battleResult' | 'deck' | 'none';

export const ScreenContainerRoot = styled.div`
  width: min(100vh, 100vw);
  margin: auto;
`;

export function ScreenContainer() {
  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');

  const { addCards, endBattle, resetGame } = useActions();
  const { clearUndo } = useUndo();

  const game = useGameState();

  // passed to battle screen so it doesn't update after battle is over
  const endOfBattleGameRef = useRef<GameState>();
  const wonLastBattleRef = useRef(false);
  const cardSelectionOptionsRef = useRef<CardState[]>([]);

  const startCardSelection = useCallback(() => {
    endOfBattleGameRef.current = undefined;
    cardSelectionOptionsRef.current = getRandomCards(NUM_CARD_SELECTION_OPTIONS);
    setScreen('cardSelection');
    setOverlay('none');
  }, []);

  const handleCardsSelected = useCallback(
    (selectedCardIndexes: number[]) => {
      const cards = cardSelectionOptionsRef.current.filter((_, i) =>
        selectedCardIndexes.includes(i),
      );
      addCards(cards);
      setScreen('battle');
      clearUndo();
    },
    [addCards, clearUndo],
  );

  const handleBattleOver = useCallback(() => {
    endOfBattleGameRef.current = game;
    wonLastBattleRef.current = getBattleWinner(game) === 'user';
    endBattle();
    setOverlay('battleResult');
  }, [game, endBattle]);

  const handleGameOver = useCallback(() => {
    resetGame();
    setScreen('start');
  }, [resetGame]);

  return (
    <ScreenContainerRoot>
      {screen === 'start' && <StartScreen onContinue={startCardSelection}></StartScreen>}

      {screen === 'cardSelection' && (
        <CardSelectionScreen
          game={game}
          cards={cardSelectionOptionsRef.current}
          onCardsSelected={handleCardsSelected}
          onViewDeck={() => setOverlay('deck')}
        ></CardSelectionScreen>
      )}

      {screen === 'battle' && (
        <BattleScreen
          game={endOfBattleGameRef.current || game}
          onBattleOver={handleBattleOver}
          onViewDeck={() => setOverlay('deck')}
          hasOverlay={overlay !== 'none'}
        ></BattleScreen>
      )}

      {overlay !== 'none' && (
        <OverlayBackground>
          {overlay === 'battleResult' && (
            <BattleResultOverlay
              game={game}
              wonLastBattle={wonLastBattleRef.current}
              onContinue={isGameOver(game) ? handleGameOver : startCardSelection}
            ></BattleResultOverlay>
          )}

          {overlay === 'deck' && (
            <ViewDeckOverlay game={game} onBack={() => setOverlay('none')}></ViewDeckOverlay>
          )}
        </OverlayBackground>
      )}
    </ScreenContainerRoot>
  );
}

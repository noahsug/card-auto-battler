import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { NUM_CARD_SELECTION_OPTIONS } from '../../../game/constants';
import { CardState, GameState } from '../../../game/gameState';
import { getRandomCards } from '../../../game/utils/getRandomCards';
import { getBattleWinner, isGameOver } from '../../../game/utils/selectors';
import { useGameState } from '../../hooks/useGameState';
import { BattleResultOverlay } from '../BattleResultOverlay';
import { BattleScreen } from '../BattleScreen';
import { CardSelectionScreen } from '../CardSelectionScreen';
import { OverlayBackground } from '../shared/OverlayBackground';
import { StartScreen } from '../StartScreen';
import { ViewDeckOverlay } from '../ViewDeckOverlay';
import backgroundImage from './main-background.png';

type ScreenType = 'start' | 'cardSelection' | 'battle';
type OverlayType = 'battleResult' | 'deck' | 'none';

export const Root = styled.div`
  width: 100vw;
  height: 100vh;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
`;

export const ScreenContainer = styled.div`
  width: min(100vh, 100vw);
  margin: auto;
`;

export function App() {
  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');

  const { game, actions, undoManager } = useGameState();
  const { addCards, endBattle, resetGame } = actions;
  const { clearUndo } = undoManager;

  // passed to battle screen so it doesn't update after battle is over
  const endOfBattleGameRef = useRef<GameState>();
  const wonLastBattleRef = useRef(false);
  const cardSelectionOptionsRef = useRef<CardState[]>([]);

  const goToScreen = useCallback(
    (screen: ScreenType) => {
      setScreen(screen);
      setOverlay('none');
      clearUndo();
    },
    [clearUndo],
  );

  const startCardSelection = useCallback(() => {
    endOfBattleGameRef.current = undefined;
    cardSelectionOptionsRef.current = getRandomCards(NUM_CARD_SELECTION_OPTIONS);
    goToScreen('cardSelection');
  }, [goToScreen]);

  const handleCardsSelected = useCallback(
    (selectedCardIndexes: number[]) => {
      const cards = cardSelectionOptionsRef.current.filter((_, i) =>
        selectedCardIndexes.includes(i),
      );
      addCards(cards);
      goToScreen('battle');
    },
    [addCards, goToScreen],
  );

  const handleBattleOver = useCallback(() => {
    endOfBattleGameRef.current = game;
    wonLastBattleRef.current = getBattleWinner(game) === 'user';
    endBattle();
    setOverlay('battleResult');
  }, [game, endBattle]);

  const restartGame = useCallback(() => {
    resetGame();
    goToScreen('start');
  }, [goToScreen, resetGame]);

  return (
    <Root>
      <ScreenContainer>
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
            {...actions}
            {...undoManager}
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
                onContinue={isGameOver(game) ? restartGame : startCardSelection}
              ></BattleResultOverlay>
            )}

            {overlay === 'deck' && (
              <ViewDeckOverlay game={game} onBack={() => setOverlay('none')}></ViewDeckOverlay>
            )}
          </OverlayBackground>
        )}
      </ScreenContainer>
    </Root>
  );
}

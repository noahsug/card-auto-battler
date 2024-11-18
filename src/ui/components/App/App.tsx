import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { NUM_CARD_SELECTION_OPTIONS, NUM_RELIC_SELECTION_OPTIONS } from '../../../game/constants';
import { CardState, GameState, RelicState } from '../../../game/gameState';
import { getRandomCards } from '../../../game/utils/cards';
import { getRandomRelics } from '../../../game/utils/relics';
import { getBattleWinner, isGameOver, shouldPickRelic } from '../../../game/utils/selectors';
import { useGameState } from '../../hooks/useGameState';
import { BattleResultOverlay } from '../BattleResultOverlay';
import { BattleScreen } from '../BattleScreen';
import { CardSelectionScreen } from '../CardSelectionScreen';
import { RelicSelectionScreen } from '../RelicSelectionScreen';
import { OverlayBackground } from '../shared/OverlayBackground';
import { StartScreen } from '../StartScreen';
import { ViewDeckOverlay } from '../ViewDeckOverlay';
import backgroundImage from './main-background.png';

type ScreenType = 'start' | 'cardSelection' | 'relicSelection' | 'battle';
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
  // DEBUG
  // const [screen, setScreen] = useState<ScreenType>('battle');
  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');

  const { game, actions, undoManager } = useGameState();
  const { addCards, addRelic, endBattle, resetGame, startBattle } = actions;
  const { clearUndo } = undoManager;

  // passed to battle screen so it doesn't update after battle is over
  const endOfBattleGameRef = useRef<GameState>();
  const wonLastBattleRef = useRef(false);
  const cardSelectionOptionsRef = useRef<CardState[]>([]);
  const relicSelectionOptionsRef = useRef<RelicState[]>([]);

  const goToScreen = useCallback(
    async (screen: ScreenType) => {
      setScreen(screen);
      setOverlay('none');

      if (screen === 'battle') {
        startBattle();
        clearUndo();
      }
    },
    [clearUndo, startBattle],
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

      if (shouldPickRelic(game)) {
        relicSelectionOptionsRef.current = getRandomRelics(
          NUM_RELIC_SELECTION_OPTIONS,
          game.user.relics,
        );
        goToScreen('relicSelection');
      } else {
        goToScreen('battle');
      }
    },
    [addCards, game, goToScreen],
  );

  const handleRelicSelected = useCallback(
    (selectedRelicIndex: number) => {
      const relic = relicSelectionOptionsRef.current[selectedRelicIndex];
      addRelic(relic);
      goToScreen('battle');
    },
    [addRelic, goToScreen],
  );

  const handleBattleOver = useCallback(() => {
    endOfBattleGameRef.current = game;
    wonLastBattleRef.current = getBattleWinner(game) === 'user';
    endBattle();
    setOverlay('battleResult');
    clearUndo();
  }, [game, endBattle, clearUndo]);

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

        {screen === 'relicSelection' && (
          <RelicSelectionScreen
            game={game}
            relics={relicSelectionOptionsRef.current}
            onRelicSelected={handleRelicSelected}
            onViewDeck={() => setOverlay('deck')}
          ></RelicSelectionScreen>
        )}

        {screen === 'battle' && (
          <BattleScreen
            game={endOfBattleGameRef.current || game}
            {...actions}
            {...undoManager}
            onBattleOver={handleBattleOver}
            onViewDeck={() => setOverlay('deck')}
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

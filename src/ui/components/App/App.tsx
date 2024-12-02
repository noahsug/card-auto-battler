import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { CardState, GameState, RelicState, ShopName } from '../../../game/gameState';
import { getBattleWinner, getIsGameOver } from '../../../game/utils/selectors';
import { assertIsNonNullable } from '../../../utils/asserts';
import { useGameState } from '../../hooks/useGameState';
import { AddRelicsScreen } from '../AddRelicsScreen';
import { BattleResultOverlay } from '../BattleResultOverlay';
import { BattleScreen } from '../BattleScreen';
import { CardSelectionScreen, isCardSelectionScreen } from '../CardSelection/CardSelectionScreen';
import { OverlayBackground } from '../shared/OverlayBackground';
import { ShopSelectionScreen } from '../ShopSelection';
import { StartScreen } from '../StartScreen';
import { ViewDeckOverlay } from '../ViewDeckOverlay';
import backgroundImage from './main-background.png';

export type ScreenType = ShopName | 'selectShop' | 'start' | 'addCards' | 'battle';
type OverlayType = 'battleResults' | 'deck' | 'none';

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
  const { game, actions, select, setGameState } = useGameState();
  const {
    getAddCardOptions,
    getAddRelicOptions,
    getAddPotionOptions,
    getShopOptions,
    addCards,
    removeCards,
    chainCards,
    featherCards,
    addRelic,
    endBattle,
    resetGame,
    startBattle,
    rewind,
  } = actions;
  const isGameOver = getIsGameOver(game);
  const battleWinner = getBattleWinner(game);

  // passed to battle screen so it doesn't update after battle is over
  const endOfBattleGameRef = useRef<GameState>();
  const wonLastBattleRef = useRef(false);
  const cardOptionsRef = useRef<CardState[]>([]);
  const relicOptionsRef = useRef<RelicState[]>([]);
  const shopOptionsRef = useRef<ShopName[]>([]);
  const rewindGameStateRef = useRef<GameState>();

  // DEBUG
  // -----------------
  // const [screen, setScreen] = useState<ScreenType>('battle');

  // const [screen, setScreen] = useState<ScreenType>('cardSelection');
  // cardSelectionOptionsRef.current = getRandomCards(NUM_CARD_SELECTION_OPTIONS);

  // const [screen, setScreen] = useState<ScreenType>('relicSelectionScreen');
  // relicSelectionOptionsRef.current = getRandomRelics(NUM_RELIC_SELECTION_OPTIONS, game.user.relics);

  // const [screen, setScreen] = useState<ScreenType>('removeCardsScreen');

  // const [screen, setScreen] = useState<ScreenType>('cardChainScreen');

  // const [overlay, setOverlay] = useState<OverlayType>('battleResults');

  // -----------------

  const [screen, setScreen] = useState<ScreenType>('start');
  const [overlay, setOverlay] = useState<OverlayType>('none');

  const goToScreen = useCallback(
    async (screen: ScreenType) => {
      if (screen === 'battle') {
        startBattle();
      }
      setScreen(screen);
      setOverlay('none');
    },
    [startBattle],
  );

  const startCardSelection = useCallback(async () => {
    rewindGameStateRef.current = await select((game) => structuredClone(game));
    endOfBattleGameRef.current = undefined;
    cardOptionsRef.current = await getAddCardOptions();
    goToScreen('addCards');
  }, [getAddCardOptions, goToScreen, select]);

  const handleGoToShop = useCallback(
    async (shop: ShopName) => {
      if (shop === 'addRelics') {
        relicOptionsRef.current = await getAddRelicOptions();
      } else if (shop === 'addPotions') {
        cardOptionsRef.current = await getAddPotionOptions();
      } else {
        cardOptionsRef.current = game.user.cards;
      }
      goToScreen(shop);
    },
    [game.user.cards, getAddPotionOptions, getAddRelicOptions, goToScreen],
  );

  const handleAddCards = useCallback(
    async (cards: CardState[]) => {
      addCards(cards);

      const shopOptions = await getShopOptions();
      if (shopOptions.length === 2) {
        shopOptionsRef.current = shopOptions;
        goToScreen('selectShop');
      } else if (shopOptions.length === 1) {
        handleGoToShop(shopOptions[0]);
      } else {
        // pick nothing and go straight to the battle
        goToScreen('battle');
      }
    },
    [addCards, getShopOptions, goToScreen, handleGoToShop],
  );

  const handleAddRelics = useCallback(
    (relic: RelicState) => {
      addRelic(relic);
      goToScreen('battle');
    },
    [addRelic, goToScreen],
  );

  const handleCardsSelected = useCallback(
    async (cards: CardState[]) => {
      if (screen === 'addCards') {
        handleAddCards(cards);
        return;
      }

      if (screen === 'addPotions') {
        addCards(cards);
      } else if (screen === 'removeCards') {
        removeCards(cards);
      } else if (screen === 'chainCards') {
        chainCards(cards);
      } else if (screen === 'featherCards') {
        featherCards(cards);
      }

      goToScreen('battle');
    },
    [addCards, chainCards, featherCards, goToScreen, handleAddCards, removeCards, screen],
  );

  const handleBattleOver = useCallback(() => {
    endOfBattleGameRef.current = game;
    wonLastBattleRef.current = battleWinner === 'user';
    endBattle();
    setOverlay('battleResults');
  }, [game, battleWinner, endBattle]);

  const handleRestartGame = useCallback(() => {
    resetGame();
    goToScreen('start');
  }, [goToScreen, resetGame]);

  const handleBattleResultsContinue = useCallback(() => {
    if (isGameOver) {
      handleRestartGame();
    } else {
      if (!wonLastBattleRef.current) {
        assertIsNonNullable(rewindGameStateRef.current);
        rewind(rewindGameStateRef.current);
      }
      startCardSelection();
    }
  }, [handleRestartGame, isGameOver, rewind, startCardSelection]);

  const handleCloseViewDeckOverlay = useCallback(() => {
    setOverlay('none');
  }, []);

  const handleOnViewDeck = useCallback(() => {
    setOverlay('deck');
  }, []);

  return (
    <Root>
      <ScreenContainer>
        {screen === 'start' && <StartScreen onContinue={startCardSelection}></StartScreen>}

        {isCardSelectionScreen(screen) && (
          <CardSelectionScreen
            type={screen}
            game={game}
            cards={cardOptionsRef.current}
            onCardsSelected={handleCardsSelected}
            onViewDeck={handleOnViewDeck}
          ></CardSelectionScreen>
        )}

        {screen === 'addRelics' && (
          <AddRelicsScreen
            game={game}
            relics={relicOptionsRef.current}
            onRelicSelected={handleAddRelics}
            onViewDeck={handleOnViewDeck}
          ></AddRelicsScreen>
        )}

        {screen === 'selectShop' && (
          <ShopSelectionScreen
            game={game}
            shopOptions={shopOptionsRef.current!}
            onShopSelected={handleGoToShop}
            onViewDeck={handleOnViewDeck}
          ></ShopSelectionScreen>
        )}

        {screen === 'battle' && (
          <BattleScreen
            game={endOfBattleGameRef.current || game}
            {...actions}
            setGameState={setGameState}
            onBattleOver={handleBattleOver}
            onViewDeck={handleOnViewDeck}
            hasOverlay={overlay !== 'none'}
          ></BattleScreen>
        )}

        {overlay !== 'none' && (
          <OverlayBackground>
            {overlay === 'battleResults' && (
              <BattleResultOverlay
                game={game}
                wonLastBattle={wonLastBattleRef.current}
                onContinue={handleBattleResultsContinue}
                onGiveUp={handleRestartGame}
              ></BattleResultOverlay>
            )}

            {overlay === 'deck' && (
              <ViewDeckOverlay game={game} onClose={handleCloseViewDeckOverlay}></ViewDeckOverlay>
            )}
          </OverlayBackground>
        )}
      </ScreenContainer>
    </Root>
  );
}

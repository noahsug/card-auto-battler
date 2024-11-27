import { useCallback, useRef, useState } from 'react';
import { styled } from 'styled-components';

import { ShopName } from '../../../game/actions';
import { CardState, GameState, RelicState } from '../../../game/gameState';
import { getBattleWinner, getIsGameOver } from '../../../game/utils/selectors';
import { assertIsNonNullable } from '../../../utils/asserts';
import { useGameState } from '../../hooks/useGameState';
import { AddRelicsScreen } from '../AddRelicsScreen';
import { BattleResultOverlay } from '../BattleResultOverlay';
import { BattleScreen } from '../BattleScreen';
import { AddCardScreen } from '../CardSelection/AddCardScreen';
import { ChainCardsScreen } from '../CardSelection/ChainCardsScreen';
import { RemoveCardsScreen } from '../CardSelection/RemoveCardsScreen';
import { OverlayBackground } from '../shared/OverlayBackground';
import { ShopSelectionScreen } from '../ShopSelection';
import { StartScreen } from '../StartScreen';
import { ViewDeckOverlay } from '../ViewDeckOverlay';
import backgroundImage from './main-background.png';
import { AddPotionsScreen } from '../CardSelection/AddPotionsScreen';

type ScreenType = ShopName | 'selectShop' | 'start' | 'addCards' | 'battle';
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
    initializeEnemy,
    getAddCardsOptions,
    getRelicAddOptions,
    getAddPotionOptions,
    getShopOptions,
    addCards,
    removeCards,
    chainCards,
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
  const potionOptionsRef = useRef<CardState[]>([]);
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
    initializeEnemy();
    endOfBattleGameRef.current = undefined;
    cardOptionsRef.current = await getAddCardsOptions();
    goToScreen('addCards');
  }, [getAddCardsOptions, goToScreen, initializeEnemy, select]);

  const handleGoToShop = useCallback(
    async (shop: ShopName) => {
      if (shop === 'addRelics') {
        relicOptionsRef.current = await getRelicAddOptions();
      } else if (shop === 'addPotions') {
        potionOptionsRef.current = await getAddPotionOptions();
      }
      goToScreen(shop);
    },
    [getAddPotionOptions, getRelicAddOptions, goToScreen],
  );

  const handleCardsAdded = useCallback(
    async (selectedCardIndexes: number[]) => {
      const cards = selectedCardIndexes.map((i) => cardOptionsRef.current[i]);
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

  const handleCardsRemoved = useCallback(
    (selectedCardIndexes: number[]) => {
      removeCards(selectedCardIndexes);
      goToScreen('battle');
    },
    [removeCards, goToScreen],
  );

  const handleCardsChained = useCallback(
    (selectedCardIndexes: number[]) => {
      chainCards(selectedCardIndexes);
      goToScreen('battle');
    },
    [chainCards, goToScreen],
  );

  const handleRelicSelected = useCallback(
    (selectedRelicIndex: number) => {
      const relic = relicOptionsRef.current[selectedRelicIndex];
      addRelic(relic);
      goToScreen('battle');
    },
    [addRelic, goToScreen],
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

        {screen === 'addCards' && (
          <AddCardScreen
            game={game}
            cards={cardOptionsRef.current}
            onCardsSelected={handleCardsAdded}
            onViewDeck={handleOnViewDeck}
          ></AddCardScreen>
        )}

        {screen === 'addPotions' && (
          <AddPotionsScreen
            game={game}
            cards={potionOptionsRef.current}
            onCardsSelected={handleCardsAdded}
            onViewDeck={handleOnViewDeck}
          ></AddPotionsScreen>
        )}

        {screen === 'selectShop' && (
          <ShopSelectionScreen
            game={game}
            shopOptions={shopOptionsRef.current!}
            onShopSelected={handleGoToShop}
            onViewDeck={handleOnViewDeck}
          ></ShopSelectionScreen>
        )}

        {screen === 'removeCards' && (
          <RemoveCardsScreen
            game={game}
            onCardsSelected={handleCardsRemoved}
            onViewDeck={handleOnViewDeck}
          ></RemoveCardsScreen>
        )}

        {screen === 'chainCards' && (
          <ChainCardsScreen
            game={game}
            onCardsSelected={handleCardsChained}
            onViewDeck={handleOnViewDeck}
          ></ChainCardsScreen>
        )}

        {screen === 'addRelics' && (
          <AddRelicsScreen
            game={game}
            relics={relicOptionsRef.current}
            onRelicSelected={handleRelicSelected}
            onViewDeck={handleOnViewDeck}
          ></AddRelicsScreen>
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

import React from 'react';
import { CardState, GameState, CardShopName } from '../../../game/gameState';
import { AddCardsScreen } from './AddCardsScreen';
import { RemoveCardsScreen } from './RemoveCardsScreen';
import { ChainCardsScreen } from './ChainCardsScreen';
import { AddPotionsScreen } from './AddPotionsScreen';
import { ScreenType } from '../App/App';

// TODO: rename CardShopName to CardShopType
export type CardSelectionScreenType = CardShopName | 'addCards';

const screensByName = {
  addCards: AddCardsScreen,
  addPotions: AddPotionsScreen,
  removeCards: RemoveCardsScreen,
  chainCards: ChainCardsScreen,
} satisfies Record<CardSelectionScreenType, object>;

export function isCardSelectionScreen(screen: ScreenType): screen is CardSelectionScreenType {
  return screen in screensByName;
}

interface CardSelectionScreenProps {
  type: CardSelectionScreenType;
  game: GameState;
  cards: CardState[];
  onCardsSelected: (cards: CardState[]) => void;
  onViewDeck: () => void;
}

export const CardSelectionScreen: React.FC<CardSelectionScreenProps> = ({
  type,
  game,
  cards,
  onCardsSelected,
  onViewDeck,
}) => {
  const Screen = screensByName[type];
  return (
    <Screen game={game} cards={cards} onCardsSelected={onCardsSelected} onViewDeck={onViewDeck} />
  );
};

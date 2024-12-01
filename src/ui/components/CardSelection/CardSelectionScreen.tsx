import React from 'react';
import { CardState, GameState, CardShopName } from '../../../game/gameState';
import { AddCardsScreen } from './AddCardsScreen';
import { RemoveCardsScreen } from './RemoveCardsScreen';
import { ChainCardsScreen } from './ChainCardsScreen';
import { AddPotionsScreen } from './AddPotionsScreen';
import { ScreenType } from '../App/App';
import { FeatherCardsScreen } from './FeatherCardsScreen';

// TODO: rename CardShopName to CardShopType
export type CardSelectionScreenType = CardShopName | 'addCards';

const screensByName = {
  addCards: AddCardsScreen,
  addPotions: AddPotionsScreen,
  removeCards: RemoveCardsScreen,
  chainCards: ChainCardsScreen,
  featherCards: FeatherCardsScreen,
} satisfies Record<CardSelectionScreenType, object>;

export function isCardSelectionScreen(screen: ScreenType): screen is CardSelectionScreenType {
  return screen in screensByName;
}

export interface GenericCardSelectionProps {
  game: GameState;
  cards: CardState[];
  onCardsSelected: (cards: CardState[]) => void;
  onViewDeck: () => void;
}

interface CardSelectionScreenProps extends GenericCardSelectionProps {
  type: CardSelectionScreenType;
}

export function CardSelectionScreen({
  type,
  game,
  cards,
  onCardsSelected,
  onViewDeck,
}: CardSelectionScreenProps) {
  const Screen = screensByName[type];
  return (
    <Screen game={game} cards={cards} onCardsSelected={onCardsSelected} onViewDeck={onViewDeck} />
  );
}

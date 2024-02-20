import {
  strengthCards,
  bleedCards,
  lowHealthCards,
  healCards,
  millCards,
  trashCards,
  multicardCards,
  strengthCard,
  multihitCard,
  extraPlayCard,
  gainStrengthForBleedCard,
  bleedCard,
  bleedTrashCard,
  strengthTrashCard,
  damageForEachBleedCard,
  damageWithoutConsumingBleedCard,
  extraCardIfHighDamageCard,
  lifestealCard,
  damageCard,
  healCard,
  damageForEachCard,
  damageSelfIfMissCard,
  trashCard,
  extraCardIfHighHealthCard,
  extraPlayHealCard,
  healForEachTrashedCard,
  extraPlayIfLowHealthCard,
} from './cards';
import { getStartingCards, getCardSelectionsForBattle } from './cardSelection';
import { CARD_SELECTION_PICKS } from './constants';
import { CardState } from './gameState';

export const enemyTypes = [
  'strength',
  'bleed',
  'lowHealth',
  'heal',
  'mill',
  'trash',
  'multicard',
] as const;

export type EnemyType = (typeof enemyTypes)[number];

const genericallyGoodCards = [
  damageCard,
  extraPlayCard,
  healCard,
  damageForEachCard,
  damageSelfIfMissCard,
  extraPlayHealCard,
];

const cardPriorityByType = {
  strength: [
    // top priority to bottom priority
    [...strengthCards, strengthTrashCard, strengthCard, multihitCard],
    [extraPlayCard, damageWithoutConsumingBleedCard],
    [gainStrengthForBleedCard, bleedCard, bleedTrashCard, damageForEachBleedCard],
    genericallyGoodCards,
  ],
  bleed: [
    // top priority to bottom priority
    [...bleedCards, bleedTrashCard, bleedCard, lifestealCard, multihitCard],
    [extraPlayCard],
    [strengthCard, strengthTrashCard, extraCardIfHighDamageCard],
    genericallyGoodCards,
  ],
  lowHealth: [
    // top priority to bottom priority
    [...lowHealthCards, damageSelfIfMissCard],
    genericallyGoodCards,
  ],
  heal: [
    // top priority to bottom priority
    healCards,
    [healCard, lifestealCard],
    genericallyGoodCards,
  ],
  mill: [
    // top priority to bottom priority
    millCards,
    [trashCard, healForEachTrashedCard],
    [healCard, extraPlayHealCard, extraCardIfHighHealthCard],
    [extraPlayCard],
  ],
  trash: [
    // top priority to bottom priority
    trashCards,
    [trashCard, ...millCards],
    genericallyGoodCards,
  ],
  multicard: [
    // top priority to bottom priority
    multicardCards,
    [extraPlayCard],
    [extraPlayIfLowHealthCard],
    genericallyGoodCards,
  ],
};

export function getEnemyCardsForBattle(battleCount: number) {
  const cards = getStartingCards();

  const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  for (let i = 0; i < battleCount + 1; i++) {
    cards.push(...pickCards(enemyType));
  }

  return cards;
}

// Returns CARD_SELECTION_PICKS cards based on enemy type.
// Assumes "cards" is unique, as we only pick one of each type.
function pickCards(enemyType: EnemyType) {
  const cardOptions = getCardSelectionsForBattle();
  const cardOptionsSet = new Set(cardOptions);
  const selectedCards: CardState[] = [];

  const cardPriority = cardPriorityByType[enemyType];
  cardPriority.find((priorityCards) => {
    return priorityCards.find((priorityCard) => {
      if (cardOptionsSet.has(priorityCard)) {
        selectedCards.push(priorityCard);
      }
      return selectedCards.length >= CARD_SELECTION_PICKS;
    });
  });

  // if we didn't find enough cards we liked, pick random cards
  for (let i = selectedCards.length; i < CARD_SELECTION_PICKS; i++) {
    const randomCard = cardOptions[Math.floor(Math.random() * cardOptions.length)];
    selectedCards.push(randomCard);
  }

  return selectedCards;
}

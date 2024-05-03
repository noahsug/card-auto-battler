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
  trashAndExtraPlayCard,
  selfDamageCard,
  damageForEachMissingHealthCard,
  doubleDodgeIfLowHealthCard,
  extraPlaysTrashCard,
  extraPlayIfExtraPlayCard,
} from './cards';
import { getStartingCards, getCardSelectionsForBattle } from './cardSelection';
import { NUM_CARD_SELECTION_PICKS } from './constants';
import { CardState, EnemyType } from './gameState';

const generallyGoodCards = [
  extraPlaysTrashCard,
  damageCard,
  extraPlayCard,
  healCard,
  damageForEachCard,
  damageSelfIfMissCard,
  extraPlayHealCard,
  trashAndExtraPlayCard,
  selfDamageCard,
  damageForEachMissingHealthCard,
  doubleDodgeIfLowHealthCard,
  strengthTrashCard,
  strengthCard,
  bleedTrashCard,
  bleedCard,
  multihitCard,
  extraPlayIfExtraPlayCard,
];

const cardPriorityByType = {
  strength: [
    [...strengthCards, strengthTrashCard, strengthCard, multihitCard], // best
    [extraPlayCard],
    [gainStrengthForBleedCard, bleedCard, bleedTrashCard, damageForEachBleedCard],
    generallyGoodCards,
  ],
  bleed: [
    [...bleedCards, bleedTrashCard, bleedCard, lifestealCard, multihitCard], // best
    [extraPlayCard],
    [strengthCard, strengthTrashCard, extraCardIfHighDamageCard],
    generallyGoodCards,
  ],
  lowHealth: [
    [...lowHealthCards, damageSelfIfMissCard], // best
    generallyGoodCards,
  ],
  heal: [
    healCards, // best
    [healCard, lifestealCard], // good
    generallyGoodCards,
  ],
  mill: [
    millCards, // best
    [trashCard, healForEachTrashedCard, trashAndExtraPlayCard], // good
    [healCard, extraPlayHealCard, extraCardIfHighHealthCard], // okay
    [extraPlayCard], // neutral
    [doubleDodgeIfLowHealthCard, extraPlayIfLowHealthCard, damageForEachMissingHealthCard], // bad but occasionally helpful
  ],
  trash: [
    [...trashCards, extraPlaysTrashCard], // best
    [trashCard, ...millCards], // good
    generallyGoodCards,
  ],
  multicard: [
    multicardCards, // best
    [extraPlayCard], // good
    [extraPlayIfLowHealthCard], // okay
    generallyGoodCards,
  ],
};

export function getEnemyCardsForBattle({
  battleNumber,
  enemyType,
}: {
  battleNumber: number;
  enemyType: EnemyType;
}) {
  const cards = getStartingCards();

  for (let i = 0; i < battleNumber + 1; i++) {
    cards.push(...pickEnemyCards(enemyType));
  }

  return cards;
}

// Returns CARD_SELECTION_PICKS cards based on enemy type.
export function pickEnemyCards(enemyType: EnemyType) {
  const cardOptions = getCardSelectionsForBattle();
  const cardOptionsSet = new Set(cardOptions);
  const selectedCards: CardState[] = [];

  const cardPriority = cardPriorityByType[enemyType];
  cardPriority.find((priorityCards, i) => {
    return priorityCards.find((priorityCard) => {
      if (cardOptionsSet.has(priorityCard)) {
        // iterate through each priority card since there may be duplicates
        return cardOptions.find((card) => {
          if (card === priorityCard) {
            selectedCards.push(card);
          }
          return selectedCards.length >= NUM_CARD_SELECTION_PICKS;
        });
      }
      return false;
    });
  });

  // if we didn't find enough cards we liked, pick random cards
  for (let i = selectedCards.length; i < NUM_CARD_SELECTION_PICKS; i++) {
    const randomCard = cardOptions[Math.floor(Math.random() * cardOptions.length)];
    selectedCards.push(randomCard);
  }

  return selectedCards;
}

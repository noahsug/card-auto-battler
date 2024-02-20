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
  getCardName,
  trashAndExtraPlayCard,
  selfDamageCard,
  damageForEachMissingHealthCard,
  doubleDodgeIfLowHealthCard,
  extraPlaysTrashCard,
  extraPlayIfExtraPlayCard,
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

export function getEnemyCardsForBattle(battleCount: number) {
  const cards = getStartingCards();

  const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

  for (let i = 0; i < battleCount + 1; i++) {
    cards.push(...pickCards(enemyType));
  }

  console.log('enemyType', enemyType, cards.map(getCardName).join(', '));

  return cards;
}

// Returns CARD_SELECTION_PICKS cards based on enemy type.
function pickCards(enemyType: EnemyType) {
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
            console.log('pick', i, getCardName(card));
            selectedCards.push(card);
          }
          return selectedCards.length >= CARD_SELECTION_PICKS;
        });
      }
      return false;
    });
  });

  // if we didn't find enough cards we liked, pick random cards
  for (let i = selectedCards.length; i < CARD_SELECTION_PICKS; i++) {
    const randomCard = cardOptions[Math.floor(Math.random() * cardOptions.length)];
    selectedCards.push(randomCard);
    console.log('pick', '-1', getCardName(randomCard));
    console.log(cardOptions.map(getCardName).join(', '));
  }

  return selectedCards;
}

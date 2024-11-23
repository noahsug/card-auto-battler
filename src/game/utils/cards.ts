import { cardsByName } from '../../content/cards';
import { createCard, value as v } from '../../content/utils/createCard';
import { CardEffectName, CardState, PlayerState } from '../gameState';

const { attack } = cardsByName;

export function addCardsToPlayer(player: PlayerState, cards: CardState[]) {
  const maxAcquiredId = player.cards.reduce((max, card) => Math.max(max, card.acquiredId), 0);
  cards.forEach((card, i) => {
    card.acquiredId = maxAcquiredId + 1 + i;
  });
  player.cards.push(...cards);
}

const monkPunch = createCard([{ name: 'damage', value: v(4), multiHit: v(2) }], {
  name: `${attack.name} (Monk)`,
  description: 'Deal 4 damage 2 times.',
});

export function convertBasicAttacksToMonkAttack(cards: CardState[]) {
  cards.forEach((card) => {
    if (card.name !== attack.name) return;
    Object.assign(card, {
      name: monkPunch.name,
      description: monkPunch.description,
      effects: monkPunch.effects,
    });
  });
}

export function getBasicValue(card: CardState, name: CardEffectName) {
  const effect = card.effects.find((effect) => effect.name === name);
  const value = effect?.value;
  if (value?.type === 'basicValue') {
    return value.value;
  }
  throw new Error(`card does not have basic effect: ${name}`);
}

import { cardsByName } from '../../content/cards';
import { value as v } from '../../content/utils/createCard';
import { CardEffectName, CardState, PlayerState } from '../gameState';

const { attack } = cardsByName;

export function addCardsToPlayer(player: PlayerState, cards: CardState[]) {
  const maxAcquiredId = player.cards.reduce((max, card) => Math.max(max, card.acquiredId), 0);
  cards.forEach((card, i) => {
    card.acquiredId = maxAcquiredId + 1 + i;
  });
  player.cards.push(...cards);
}

export function convertBasicAttacksToMonkAttack(cards: CardState[]) {
  cards.forEach((card) => {
    if (card.name !== attack.name) return;
    card.repeat = { value: v(1) };
    card.description += ' Repeat.';
    card.name = `${attack.name} (Monk)`;
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

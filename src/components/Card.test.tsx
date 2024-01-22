import { render } from '@testing-library/react';

import Card from './Card';
import { CardState, createCard, createCustomCard, statusEffectNames } from '../gameState';
import { STATUS_EFFECT_SYMBOLS } from './StatusEffects';

describe('text', () => {
  function replaceWithSymbol(text: string, phrase: string, symbol: string) {
    if (!text.includes(phrase)) return text;

    // 5 damage -> 5⚔️
    text = text.replace(new RegExp(`(\\d+) ${phrase}`), `$1${symbol}`);

    // damage -> ⚔️
    text = text.replace(phrase, symbol);

    return text;
  }

  function toCardText(...textSections: string[]) {
    const cardTextSections: string[] = [];

    textSections.forEach((text) => {
      text = replaceWithSymbol(text, 'damage', '⚔️');

      statusEffectNames.forEach((effectName) => {
        text = replaceWithSymbol(text, effectName, STATUS_EFFECT_SYMBOLS[effectName]);
      });

      cardTextSections.push(text);
    });

    return cardTextSections.join('');
  }

  function getCardElement(cardState: CardState) {
    const { baseElement } = render(<Card card={cardState} />);
    return baseElement;
  }

  it('renders damage', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5 }));

    expect(card.textContent).toBe(toCardText('5 damage'));
  });

  it('renders self damage', () => {
    const card = getCardElement(createCard({ target: 'self', damage: 5 }));

    expect(card.textContent).toBe(toCardText('5 damage', 'to self'));
  });

  it('renders a status effect', () => {
    const card = getCardElement(createCard({ target: 'opponent', bleed: 2 }));

    expect(card.textContent).toBe(toCardText('2 bleed'));
  });

  it('renders trash', () => {
    const card = getCardElement(
      createCustomCard({ trash: true }, { target: 'opponent', damage: 5 }),
    );

    expect(card.textContent).toBe(toCardText('5 damage', 'trash'));
  });

  it('renders repeat', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5, repeat: 2 }));

    expect(card.textContent).toBe(toCardText(`5 damage`, '3x times'));
  });

  describe('for effect based on player value', () => {
    it('renders +damage for each bleed', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          effectBasedOnPlayerValue: {
            effectName: 'damage',
            basedOn: { target: 'opponent', valueName: 'bleed' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('+1 damage for each opponent bleed'));
    });

    it('renders damage and +times for each bleed', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 5,
          effectBasedOnPlayerValue: {
            effectName: 'repeat',
            basedOn: { target: 'opponent', valueName: 'bleed' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('5 damage', '+1x times for each opponent bleed'));
    });

    it('renders damage X times for each bleed', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 1,
          repeat: -1,
          effectBasedOnPlayerValue: {
            effectName: 'repeat',
            basedOn: { target: 'opponent', valueName: 'bleed' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('1 damage', 'for each opponent bleed'));
    });
  });
});

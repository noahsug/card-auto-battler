import { render } from '@testing-library/react';

import Card from './Card';
import { CardState, createCard, createCustomCard } from '../gameState';
import { CARD_TEXT_SYMBOLS } from './CardEffectText';

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
    const symbolNames = Object.keys(CARD_TEXT_SYMBOLS) as Array<keyof typeof CARD_TEXT_SYMBOLS>;

    // sort symbol names from shorter to longer to avoid a shorter name replacing part of a longer name
    symbolNames.sort((a, b) => a.length - b.length);

    const cardTextSections = textSections.map((text) => {
      symbolNames.forEach((symbolName) => {
        const symbol = CARD_TEXT_SYMBOLS[symbolName];
        text = replaceWithSymbol(text, symbolName, symbol);
      });
      return text;
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
          effectFromPlayerValue: {
            effectName: 'damage',
            playerValueIdentifier: { target: 'opponent', valueName: 'bleed' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('+1 damage for each opponent bleed'));
    });

    it('renders damage and +times for each strength', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 2,
          effectFromPlayerValue: {
            effectName: 'repeat',
            playerValueIdentifier: { target: 'self', valueName: 'strength' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('2 damage', '+1x times for each self strength'));
    });

    it('renders damage X times for each health', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 1,
          repeat: -1,
          effectFromPlayerValue: {
            effectName: 'repeat',
            playerValueIdentifier: { target: 'self', valueName: 'health' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('1 damage', 'for each self health'));
    });

    it('+dodge for each trashed card', () => {
      const card = getCardElement(
        createCard({
          target: 'self',
          effectFromPlayerValue: {
            effectName: 'dodge',
            playerValueIdentifier: { target: 'self', valueName: 'trashedCards' },
          },
        }),
      );

      expect(card.textContent).toBe(toCardText('+1 dodge for each self trashedCards', 'to self'));
    });
  });
});

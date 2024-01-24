import { render } from '@testing-library/react';

import Card from './Card';
import { CardState, createCard, createCustomCard } from '../gameState';

describe('text', () => {
  function getCardElement(cardState: CardState) {
    const { baseElement } = render(<Card card={cardState} />);
    return baseElement;
  }

  it('renders damage', () => {
    const card = getCardElement(createCard({ target: 'opponent', damage: 5 }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️"`);
  });

  it('renders multiple card effects', () => {
    const card = getCardElement(
      createCard(
        { target: 'opponent', damage: 5, bleed: 2 },
        { target: 'self', dodge: 1, extraCardPlays: 1, strength: 1, repeat: 1 },
      ),
    );

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️2🩸1🃏1💨1💪2x timesto self"`);
  });

  it('renders self damage', () => {
    const card = getCardElement(createCard({ target: 'self', damage: 5 }));

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️to self"`);
  });

  it('renders a status effect', () => {
    const card = getCardElement(createCard({ target: 'opponent', bleed: 2 }));

    expect(card.textContent).toMatchInlineSnapshot(`"2🩸"`);
  });

  it('renders trash', () => {
    const card = getCardElement(
      createCustomCard({ trash: true }, { target: 'opponent', damage: 5 }),
    );

    expect(card.textContent).toMatchInlineSnapshot(`"5⚔️trash"`);
  });

  describe('renders repeat', () => {
    it('with positive repeat', () => {
      const card = getCardElement(createCard({ target: 'opponent', damage: 5, repeat: 2 }));

      expect(card.textContent).toMatchInlineSnapshot(`"5⚔️3x times"`);
    });
    it('with -1 repeat', () => {
      const card = getCardElement(createCard({ target: 'opponent', damage: 5, repeat: -1 }));

      expect(card.textContent).toMatchInlineSnapshot(`"5⚔️0x times"`);
    });
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

      expect(card.textContent).toMatchInlineSnapshot(`"+1⚔️ for each opponent 🩸"`);
    });

    it('renders damage and +times for each strength', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 2,
          effectBasedOnPlayerValue: {
            effectName: 'repeat',
            basedOn: { target: 'self', valueName: 'strength' },
          },
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"2⚔️+1x times for each self 💪"`);
    });

    it('renders damage X times for each health', () => {
      const card = getCardElement(
        createCard({
          target: 'opponent',
          damage: 1,
          repeat: -1,
          effectBasedOnPlayerValue: {
            effectName: 'repeat',
            basedOn: { target: 'self', valueName: 'health' },
          },
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"1⚔️for each self ❤️"`);
    });

    it('+dodge for each trashed card', () => {
      const card = getCardElement(
        createCard({
          target: 'self',
          effectBasedOnPlayerValue: {
            effectName: 'dodge',
            basedOn: { target: 'self', valueName: 'trashedCards' },
          },
        }),
      );

      expect(card.textContent).toMatchInlineSnapshot(`"+1💨 for each self trashed cardsto self"`);
    });
  });
});
